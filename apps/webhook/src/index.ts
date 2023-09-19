import { Logging } from "@google-cloud/logging";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { EnrichedTransaction } from "helius-sdk";
import express, { Router } from "express";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  AnchorProvider,
  BorshCoder,
  Program,
  Wallet,
} from "@project-serum/anchor";
import { SubscriptionProgram } from "./types";
import { log } from "@libs/environment";
import { Term, getPlanCol } from "@libs/data";

const PROJECT_ID = process.env.PROJECT_ID!;

const programId = new PublicKey("6qMvvisbUX3Co1sZa7DkyCXF8FcsTjzKSQHcaDoqSLbw");

const getHeliusAuthSecret = async () => {
  const client = new SecretManagerServiceClient();
  console.log(PROJECT_ID);
  const [response] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/helius-auth/versions/latest`,
  });
  const secretString = response?.payload?.data?.toString();
  return secretString;
};

const url =
  PROJECT_ID === "solsubs-prod"
    ? "https://rpc.helius.xyz/?api-key=97602bb0-7a52-4f03-ae6a-3527f32b0f09"
    : "https://devnet.helius-rpc.com/?api-key=0c7e899d-480b-4f6f-9d6d-6e980dad3442";

const connection = new Connection(url, "confirmed");
const provider = new AnchorProvider(
  connection,
  new Wallet(Keypair.generate()),
  {}
);

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
    const idl = await Program.fetchIdl(programId, provider);
    const program = new Program(
      idl!,
      programId,
      provider
    ) as unknown as Program<SubscriptionProgram>;
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
        const accounts = tx.accountData.filter(
          (d) => d.nativeBalanceChange > 0
        );
        await log("accounts", { accounts });
        const plan = await program.account.plan.fetchNullable(
          accounts.sort(
            (a, b) => b.nativeBalanceChange - a.nativeBalanceChange
          )[0].account
        );
        await log("plan", { plan, price: plan!.price.toNumber() });
        const planCol = await getPlanCol();
        await planCol.insertOne({
          createdAt: new Date(),
          code: plan!.code,
          owner: plan!.owner.toString(),
          price: plan!.price.toNumber(),
          splToken: plan!.tokenMint.toString(),
          term: Object.keys(plan!.term)[0] as Term,
        });
        break;
      case "createSubscription":
        // store the subscription in mongo;
        // create a subscription charge event?;
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
