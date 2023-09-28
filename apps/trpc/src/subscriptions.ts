import { getPlanCol, getSubscriptionCol } from "@libs/data";
import { protectedProcedure, t } from "./context";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { connection } from "@libs/environment";

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
        .sort({ createdAt: 1 })
        .limit(500)
        .toArray();
      const [plans] = await Promise.all([
        planCol
          .find({
            _id: {
              $in: subscriptions.map((s) => new ObjectId(s.planId)),
            },
          })
          .toArray(),
      ]);
      return { subscriptions, plans };
    }),
});
