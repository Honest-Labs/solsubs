import { z } from "zod";
import { t } from "./context";
import { getUserCol, getUserVerificationMessageCol } from "@libs/data";
import { randomBytes } from "crypto";
import nacl from "tweetnacl";
import base58 from "bs58";
import { TRPCError } from "@trpc/server";
import { getAuth } from "firebase-admin/auth";
import { initFirebase } from "@libs/environment";

export const userRouter = t.router({
  getVerificationMessage: t.procedure
    .input(z.object({ publicKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userVerificationMessageCol = await getUserVerificationMessageCol();
      const message = `
      SolSubs wants you to sign in with your Solana account:
      ${input.publicKey}
      
      Click Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee. 
    
      Nonce: ${randomBytes(16).toString("hex")}
      Chain ID: mainnet
      Issued At: ${new Date()}.`;

      await userVerificationMessageCol.updateOne(
        { publicKey: input.publicKey },
        {
          $set: {
            publicKey: input.publicKey,
            message,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      return message;
    }),
  verify: t.procedure
    .input(z.object({ signature: z.array(z.number()), publicKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await initFirebase();
      const userCol = await getUserCol();
      const userVerificationMessageCol = await getUserVerificationMessageCol();
      const verificationMessage = await userVerificationMessageCol.findOne({
        publicKey: input.publicKey,
      });
      const pubKeyUint8 = base58.decode(input.publicKey);
      const nonceUint8 = new TextEncoder().encode(verificationMessage?.message);
      const verified = nacl.sign.detached.verify(
        nonceUint8,
        Uint8Array.from(input.signature),
        pubKeyUint8
      );
      if (!verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      const existing = await userCol.findOne({ publicKey: input.publicKey });
      if (!existing) {
        const ret = await userCol.insertOne({
          createdAt: new Date(),
          publicKey: input.publicKey,
        });
      }
      const auth = getAuth();
      const jwt = await auth.createCustomToken(input.publicKey);
      return jwt;
    }),
});
