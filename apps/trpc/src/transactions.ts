import { getPlanCol, getSubscriptionCol, getTransactionsCol } from "@libs/data";
import { protectedProcedure, t } from "./context";
import { z } from "zod";
import { ObjectId } from "mongodb";

export const transactionsRouter = t.router({
  getTransactions: protectedProcedure.query(async ({ ctx, input }) => {
    const subscriptionsCol = await getSubscriptionCol();
    const transactionsCol = await getTransactionsCol();
    const planCol = await getPlanCol();
    const transactions = await transactionsCol
      .find({ $or: [{ from: ctx.userId }, { to: ctx.userId }] })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const [subscriptions, plans] = await Promise.all([
      subscriptionsCol
        .find({
          _id: {
            $in: transactions.map((t) => new ObjectId(t.subscriptionId)),
          },
        })
        .toArray(),
      planCol
        .find({
          _id: {
            $in: transactions.map((t) => new ObjectId(t.planId)),
          },
        })
        .toArray(),
    ]);
    return { transactions, subscriptions, plans };
  }),
  getTransactionsTotals: protectedProcedure.query(async ({ ctx, input }) => {
    const transactionsCol = await getTransactionsCol();
    const ret = await transactionsCol
      .aggregate([
        {
          $match: {
            $or: [{ from: ctx.userId }, { to: ctx.userId }],
          },
        },
        {
          $project: {
            splToken: 1,
            type: 1,
            amount: { $divide: ["$amount", { $pow: [10, "$decimals"] }] },
          },
        },
        {
          $group: {
            _id: { splToken: "$splToken", type: "$type" },
            total: { $sum: "$amount" },
          },
        },
      ])
      .toArray();

    return ret;
  }),
});
