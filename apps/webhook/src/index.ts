import { Logging } from "@google-cloud/logging";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { EnrichedTransaction } from "helius-sdk";
import express, { Router } from "express";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  AnchorProvider,
  BorshCoder,
  Program,
  Wallet,
} from "@project-serum/anchor";
import {
  PROGRAM_DEPLOYER,
  connection,
  getPayerWallet,
  getProgram,
  log,
} from "@libs/environment";
import {
  Term,
  getPlanCol,
  getSubscriptionCol,
  getTransferCol,
} from "@libs/data";
import { SubscriptionProgram, programId } from "@libs/environment";
import { CloudTasksClient } from "@google-cloud/tasks";
import { Timestamp } from "firebase-admin/firestore";
import { ObjectId } from "mongodb";
import {
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

const PROJECT_ID = process.env.PROJECT_ID!;

const getHeliusAuthSecret = async () => {
  const client = new SecretManagerServiceClient();
  console.log(PROJECT_ID);
  const [response] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/helius-auth/versions/latest`,
  });
  const secretString = response?.payload?.data?.toString();
  return secretString;
};

export const sendChargeSubscriptionTask = async (
  subscriptionId: string,
  scheduleTime: Date
) => {
  const client = new CloudTasksClient();
  const url =
    PROJECT_ID === "solsubs-prod"
      ? "https://webhook-ioqkl6ubja-uk.a.run.app"
      : "https://webhook-ioqkl6ubja-uk.a.run.app";
  const parent = client.queuePath(
    PROJECT_ID,
    "us-east4",
    "charge-subscriptions"
  );
  await client.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: "POST",
        url: `${url}/charge-attempt/${subscriptionId}`,
        oidcToken: {
          serviceAccountEmail: `${PROJECT_ID}@appspot.gserviceaccount.com`,
        },
      },
      scheduleTime: Timestamp.fromDate(scheduleTime),
    },
  });
};

const handleCreatePlan = async (
  tx: EnrichedTransaction,
  program: Program<SubscriptionProgram>
) => {
  const accounts = tx.accountData.filter((d) => d.nativeBalanceChange > 0);
  const account = accounts.sort(
    (a, b) => b.nativeBalanceChange - a.nativeBalanceChange
  )[0].account;
  const plan = await program.account.plan.fetchNullable(account);
  const planCol = await getPlanCol();
  await planCol.insertOne({
    createdAt: new Date(),
    code: plan!.code,
    owner: plan!.owner.toString(),
    price: plan!.price.toNumber(),
    splToken: plan!.tokenMint.toString(),
    term: Object.keys(plan!.term)[0] as Term,
    account,
  });
};

const handleCreateSubscription = async (
  tx: EnrichedTransaction,
  program: Program<SubscriptionProgram>
) => {
  await log("Handle create subscription", { tx });
  const accounts = tx.accountData.filter((d) => d.nativeBalanceChange > 0);
  const account = accounts.sort(
    (a, b) => b.nativeBalanceChange - a.nativeBalanceChange
  )[0].account;
  await log("accounts", { accounts });
  const subscription = await program.account.subscription.fetchNullable(
    account
  );
  await log("subscription", { subscription });
  const subscriptionCol = await getSubscriptionCol();
  const transferCol = await getTransferCol();
  const planCol = await getPlanCol();
  const plan = await planCol.findOne({
    account: subscription!.planAccount.toString(),
  });
  console.log(subscription!.nextTermDate.toNumber());
  const nextTermDateMilliseconds = subscription!.nextTermDate.toNumber() * 1000;
  const ret = await subscriptionCol.insertOne({
    createdAt: new Date(),
    owner: subscription!.owner.toString(),
    planId: plan!._id.toString(),
    state: Object.keys(subscription!.state)[0] as any,
    nextTermDate: new Date(nextTermDateMilliseconds),
    account,
    splToken: plan!.splToken,
  });
  await transferCol.updateOne(
    {
      hash: tx.signature,
    },
    {
      $set: {
        createdAt: new Date(),
        from: subscription!.owner.toString(),
        to: plan!.owner.toString(),
        hash: tx.signature,
        planId: plan!._id.toString(),
        splToken: plan!.splToken,
        subscriptionId: ret.insertedId.toString(),
        amount: plan!.price,
        type: "payment",
      },
    }
  );
  await sendChargeSubscriptionTask(
    ret.insertedId.toString(),
    new Date(nextTermDateMilliseconds + 1000)
  );
};

const handleChargeSubscription = async (
  tx: EnrichedTransaction,
  program: Program<SubscriptionProgram>
) => {
  const subscriptionCol = await getSubscriptionCol();
  const planCol = await getPlanCol();
  const transferCol = await getTransferCol();
  const subscription = await subscriptionCol.findOne({
    account: {
      $in: tx.accountData.map((d) => d.account),
    },
  });
  if (!subscription) {
    return;
  }
  const plan = await planCol.findOne({
    _id: new ObjectId(subscription.planId),
  });
  const subscriptionAccountData =
    await program.account.subscription.fetchNullable(subscription.account);
  const nextTermDateMilliseconds =
    subscriptionAccountData!.nextTermDate.toNumber() * 1000;
  await subscriptionCol.updateOne(
    {
      _id: new ObjectId(subscription._id),
    },
    {
      $set: {
        nextTermDate: new Date(nextTermDateMilliseconds),
      },
    }
  );
  await transferCol.insertOne({
    createdAt: new Date(),
    from: subscription!.owner.toString(),
    to: plan!.owner.toString(),
    hash: tx.signature,
    planId: plan!._id.toString(),
    splToken: plan!.splToken,
    subscriptionId: subscription._id.toString(),
    amount: plan!.price,
    type: "payment",
  });
  await sendChargeSubscriptionTask(
    subscription._id.toString(),
    new Date(nextTermDateMilliseconds + 1000)
  );
};

const handleCancelSubscription = async (
  tx: EnrichedTransaction,
  program: Program<SubscriptionProgram>
) => {};

const app = express();
app.use(express.json());
app.post("/helius", async (req, res) => {
  const secret = await getHeliusAuthSecret();
  if (req.headers?.authorization !== secret) {
    return res.status(401).send("Authorization Error");
  }
  const body = req.body as { "0": EnrichedTransaction };
  const tx = body["0"];
  await log("webhook", tx);
  try {
    const program = await getProgram(Keypair.generate());
    const instruction = tx.instructions.find(
      (i) => i.programId === programId.toString()
    );
    await log("Instruction", { instruction });
    if (!instruction) {
      await log("Invalid instruction", { instruction });
      return res.status(200).send({});
    }
    const coder = new BorshCoder(program.idl);
    const instructionData = coder.instruction.decode(
      instruction!.data,
      "base58"
    );
    const instructionName = instructionData?.name!;
    switch (instructionName) {
      case "createPlan":
        await handleCreatePlan(tx, program);
        break;
      case "createSubscription":
        await handleCreateSubscription(tx, program);
        break;
      case "cancelSubscription":
        // update subscription to be pending cancellation
        break;
      case "uncancelSubscription":
        // update subscription to be active
        break;
      case "chargeSubscription":
        await handleChargeSubscription(tx, program);
        break;
      case "closeSubscription":
        // update subscription to be closed;
        // create a refund event and payout event?;
        break;
    }
  } catch (e) {
    await log("Error", { error: e });
  }
  return res.status(200).send("");
});

app.post("/charge-attempt/:subscriptionId", async (req, res) => {
  const subscriptionId = req.params.subscriptionId;
  const subscriptionCol = await getSubscriptionCol();
  const planCol = await getPlanCol();
  const subscription = await subscriptionCol.findOne({
    _id: new ObjectId(subscriptionId),
  });
  if (!subscription) {
    await log("Subscription not found", { subscriptionId });
    return res.status(200).send({});
  }
  const plan = (await planCol.findOne({
    _id: new ObjectId(subscription.planId),
  }))!;
  const payer = await getPayerWallet();
  const program = await getProgram(payer);
  const mint = new PublicKey(plan.splToken);
  const accounts = {
    deployerTokenAccount: (
      await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        PROGRAM_DEPLOYER
      )
    ).address,
    ownerTokenAccount: (
      await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        new PublicKey(plan.owner),
        true
      )
    ).address,
    planTokenAccount: getAssociatedTokenAddressSync(
      mint,
      new PublicKey(plan.account),
      true
    ),
    subscriberTokenAccount: getAssociatedTokenAddressSync(
      mint,
      new PublicKey(subscription.owner),
      true
    ),
  };
  try {
    await program.methods
      .chargeSubscription()
      .accounts({
        ...accounts,
        payer: payer.publicKey,
        planAccount: new PublicKey(plan.account),
        subscriptionAccount: new PublicKey(subscription.account),
      })
      .signers([payer])
      .rpc();
  } catch (e) {
    await log("Error charging subscription", { e: JSON.stringify(e) });
    throw e;
  }
  return res.status(200).send({});
});

app.listen(8080, () => {
  console.log("listening on 8080");
});
