import { connection, getProgram } from "@libs/environment";
import {
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import base58 from "bs58";

interface PlanConfig {
  term: "oneWeek" | "oneSecond" | "thirtySeconds";
}

const planOwner = Keypair.fromSecretKey(
  base58.decode(
    "3NrbV7oAyJJ1Lnup1c46cqHaQYZJupEnCdUzesYSev8Ujodq3D8hJSavYnC9qHmsSm92cDztqrBxJ5GxsWuMzRqd"
  )
);
const planId = "650c7393054f094fe8486942";

const mint = new PublicKey("Hn5zWLAdzFmP6uiJySdSqiPwYdSJgzCvsWLMVuCbkGzB");

const createPlan = async (config: Partial<PlanConfig> = {}) => {
  const program = await getProgram(planOwner);
  const code = "test123456";
  const [plan_account] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("plan")),
      planOwner.publicKey.toBuffer(),
      Buffer.from(anchor.utils.bytes.utf8.encode(code)),
    ],
    program.programId
  );
  const decimals = 9;
  const planTokenAccount = getAssociatedTokenAddressSync(
    mint,
    plan_account,
    true
  );
  await program.methods
    .createPlan({
      code,
      price: new anchor.BN(10 * 10 ** decimals),
      term: { [config.term || "oneWeek"]: {} },
    })
    .accounts({
      payer: planOwner.publicKey,
      planAccount: plan_account,
      planTokenAccount: planTokenAccount,
      mintAccount: mint,
    })
    .signers([planOwner])
    .rpc();

  return {
    planOwner,
    plan_account,
    mint,
    planTokenAccount,
  };
};

interface CreateSubscriptionData {
  owner: Keypair;
  mint: PublicKey;
  planAccount: PublicKey;
  planTokenAccount: PublicKey;
  amount?: number;
}

const createSubscription = async (data: CreateSubscriptionData) => {
  const { mint, owner, planAccount, planTokenAccount } = data;
  const program = await getProgram(planOwner);
  const payer = anchor.web3.Keypair.generate();
  const airdropTx = await connection.requestAirdrop(
    payer.publicKey,
    1000000000
  );
  await connection.confirmTransaction(airdropTx);
  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    true
  );
  await mintTo(
    connection,
    payer,
    mint,
    payerTokenAccount.address,
    owner,
    (data.amount || 100) * 10 ** 9
  );
  const [subscriptionAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("subscription")),
      payer.publicKey.toBuffer(),
      planAccount.toBuffer(),
    ],
    program.programId
  );
  await program.methods
    .createSubscription({
      delegationAmount: new anchor.BN(100000 * 10 ** 9),
    })
    .accounts({
      payer: payer.publicKey,
      payerTokenAccount: payerTokenAccount.address,
      planAccount: planAccount,
      subscriptionAccount,
      planTokenAccount: planTokenAccount,
    })
    .signers([payer])
    .rpc();

  return {
    subscriptionAccount,
    payer,
    payerTokenAccount,
  };
};

(async () => {
  const plan = await createPlan();
  console.log(plan);
})();
