import { connection, getProgram } from "@libs/environment";
import {
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import base58 from "bs58";
import { getPlanCol } from "@libs/data";
import { ObjectId } from "mongodb";

interface PlanConfig {
  term: "oneWeek" | "oneSecond" | "thirtySeconds";
}

const planOwner = Keypair.fromSecretKey(
  base58.decode(
    "3NrbV7oAyJJ1Lnup1c46cqHaQYZJupEnCdUzesYSev8Ujodq3D8hJSavYnC9qHmsSm92cDztqrBxJ5GxsWuMzRqd"
  )
);
const planId = "65146f26abad2795686b70a8";

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
  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    planOwner,
    mint,
    owner.publicKey,
    true
  );
  console.log(payerTokenAccount);
  await mintTo(
    connection,
    owner,
    mint,
    payerTokenAccount.address,
    planOwner,
    (data.amount || 100) * 10 ** 9
  );
  const [subscriptionAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("subscription")),
      owner.publicKey.toBuffer(),
      planAccount.toBuffer(),
    ],
    program.programId
  );
  await program.methods
    .createSubscription({
      delegationAmount: new anchor.BN(100000 * 10 ** 9),
    })
    .accounts({
      payer: owner.publicKey,
      payerTokenAccount: payerTokenAccount.address,
      planAccount: planAccount,
      subscriptionAccount,
      planTokenAccount: planTokenAccount,
    })
    .signers([owner])
    .rpc();

  return {
    subscriptionAccount,
    owner,
    payerTokenAccount,
  };
};

(async () => {
  const planCol = await getPlanCol();
  const plan = (await planCol.findOne({ _id: new ObjectId(planId) }))!;
  const owner = Keypair.generate();
  const transferSolTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: planOwner.publicKey,
      toPubkey: owner.publicKey,
      lamports: LAMPORTS_PER_SOL / 10, //Investing .1 SOL. Remember 1 Lamport = 10^-9 SOL.
    })
  );
  await connection.sendTransaction(transferSolTx, [planOwner]);
  console.log("SOL Transferred");
  await createSubscription({
    amount: 100000,
    mint: new PublicKey(plan.splToken),
    owner,
    planAccount: new PublicKey(plan.account),
    planTokenAccount: getAssociatedTokenAddressSync(
      new PublicKey(plan.splToken),
      new PublicKey(plan.account),
      true
    ),
  });
  console.log(owner.publicKey.toString());
})();
