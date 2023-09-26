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
import { getProgram, log } from "@libs/environment";
import {
  Term,
  getPlanCol,
  getSubscriptionCol,
  getTransferCol,
} from "@libs/data";
import { SubscriptionProgram, programId } from "@libs/environment";

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
  const ret = await subscriptionCol.insertOne({
    createdAt: new Date(),
    owner: subscription!.owner.toString(),
    planId: plan!._id.toString(),
    state: Object.keys(subscription!.state)[0] as any,
    nextTermDate: new Date(subscription!.nextTermDate.toNumber()),
  });
  await transferCol.insertOne({
    createdAt: new Date(),
    from: subscription!.owner.toString(),
    to: plan!.owner.toString(),
    hash: tx.signature,
    planId: plan!._id.toString(),
    splToken: plan!.splToken,
    subscriptionId: ret.insertedId.toString(),
    amount: plan!.price,
    type: "payment",
  });
};

const handleCancelSubscription = async (
  tx: EnrichedTransaction,
  program: Program<SubscriptionProgram>
) => {};

const app = express();
app.use(express.json());
app.post("/helius", async (req, res) => {
  const secret = await getHeliusAuthSecret();
  await log("Secrets", { secret, headers: req.headers.authorization });
  if (req.headers?.authorization !== secret) {
    return res.status(401).send("Authorization Error");
  }
  const body = req.body as { "0": EnrichedTransaction };
  const tx = body["0"];
  await log("webhook", tx);
  try {
    const program = await getProgram();
    const instruction = tx.instructions.find(
      (i) => i.programId === programId.toString()
    );
    await log("Instruction", { instruction });
    if (!instruction) {
      await log("Invalid instruction", { instruction });
      return res.status(200).send({});
    }
    await log("Program", {
      programId: programId.toString(),
      idl: program.idl.version,
    });
    const coder = new BorshCoder(program.idl);
    const instructionData = coder.instruction.decode(
      instruction!.data,
      "base58"
    );
    await log("instructionData", { name: instructionData?.name, tx });
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
        // create a new charge event;
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

app.listen(8080, () => {
  console.log("listening on 8080");
});
