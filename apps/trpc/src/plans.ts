import { getPlanCol } from "@libs/data";
import { protectedProcedure, t } from "./context";

export const plansRouter = t.router({
  getPlans: protectedProcedure.query(async ({ ctx, input }) => {
    const plansCol = await getPlanCol();
    const plans = await plansCol
      .find({
        owner: ctx.userId,
      })
      .sort({ createdAt: 1 })
      .limit(500)
      .toArray();

    return plans;
  }),
});
