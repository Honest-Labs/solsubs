import { getPlanCol, getSubscriptionCol, getTransactionsCol } from "@libs/data";
import { protectedProcedure, t } from "./context";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { differenceInDays } from "date-fns";

export const dashboardRouter = t.router({
  getDashboardData: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscriptionCol = await getSubscriptionCol();
      const transactionsCol = await getTransactionsCol();
      const plansCol = await getPlanCol();
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const diffInDays = Math.abs(differenceInDays(startDate, endDate));
      const totalSubscriptionsCreated = await subscriptionCol.countDocuments({
        createdAt: {
          $gte: new Date(input.startDate),
          $lte: new Date(input.endDate),
        },
        planOwner: ctx.userId,
      });
      const totalPayouts = await transactionsCol.countDocuments({
        to: ctx.userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      const getRevenueBy = async (field: "planId" | "splToken") => {
        const ret = await transactionsCol
          .aggregate([
            {
              $match: {
                to: ctx.userId,
                createdAt: {
                  $gte: new Date(input.startDate),
                  $lte: new Date(input.endDate),
                },
              },
            },
            {
              $addFields: {
                time: {
                  $dateTrunc: {
                    date: "$createdAt",
                    unit: diffInDays < 4 ? "hour" : "day",
                  },
                },
                normalizedAmount: {
                  $divide: ["$amount", { $pow: [10, "$decimals"] }],
                },
              },
            },
            {
              $group: {
                _id: { [field]: `$${field}`, time: "$time" },
                times: { $push: "$time" },
                total: { $sum: "$normalizedAmount" },
              },
            },
            {
              $group: {
                _id: `$_id.${field}`,
                sum: { $sum: "$total" },
                times: { $addToSet: { time: "$_id.time", sum: "$total" } },
              },
            },
          ])
          .toArray();

        return ret as {
          sum: number;
          times: { time: string; sum: number }[];
          _id: string;
        }[];
      };
      const revenueByPlan = await getRevenueBy("planId");
      const revenueByToken = await getRevenueBy("splToken");
      const plans = await plansCol.find({ owner: ctx.userId }).toArray();

      return {
        totalSubscriptionsCreated,
        revenueByPlan,
        plans,
        totalPayouts,
        revenueByToken,
      };
    }),
});
