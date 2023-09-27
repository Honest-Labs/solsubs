import express from "express";
import { t, createContext } from "./context";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { userRouter } from "./user";
import { plansRouter } from "./plans";

export type AppRouter = typeof appRouter;

export const appRouter = t.mergeRouters(userRouter, plansRouter);

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(8080, () => {
  console.log("listening on http://localhost:8080");
});
