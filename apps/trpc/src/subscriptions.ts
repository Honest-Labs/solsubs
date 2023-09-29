import { getPlanCol, getSubscriptionCol } from "@libs/data";
import { protectedProcedure, t } from "./context";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connection, log } from "@libs/environment";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const subscriptionRouter = t.router({
  getSubscriptions: protectedProcedure
    .input(z.boolean().optional())
    .query(async ({ ctx, input }) => {
      const isMine = input ?? false;
      const subscriptionCol = await getSubscriptionCol();
      const planCol = await getPlanCol();
      const query = isMine ? { owner: ctx.userId } : { planOwner: ctx.userId };
      const subscriptions = await subscriptionCol
        .find(query)
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();
      const [plans, ...accountInfos] = await Promise.all([
        planCol
          .find({
            _id: {
              $in: subscriptions.map((s) => new ObjectId(s.planId)),
            },
          })
          .toArray(),
        ...subscriptions.map((sub) =>
          connection.getParsedAccountInfo(
            getAssociatedTokenAddressSync(
              new PublicKey(sub.splToken),
              new PublicKey(sub.owner),
              true
            )
          )
        ),
      ]);
      const delegationInfo = accountInfos.map((info: any, i) => {
        const parsed = info?.value?.data?.parsed?.info || {};
        return {
          subscriptionId: subscriptions[i]._id.toString(),
          delegate: (parsed?.delegate || "") as string,
          delegatedAmount: parsed?.delegatedAmount?.amount as number,
        };
      });
      return {
        subscriptions,
        plans,
        delegationInfo: delegationInfo as {
          delegate: string;
          delegatedAmount: number;
          subscriptionId: string;
        }[],
      };
    }),
});
