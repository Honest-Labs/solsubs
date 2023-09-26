import { log } from "@libs/environment";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { getAuth } from "firebase-admin/auth";

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const jwt = req.headers.authorization;
  if (!jwt) {
    return {
      req,
      res,
    };
  }
  try {
    const auth = getAuth();
    const ret = await auth.verifyIdToken(jwt);
    return {
      userId: ret.uid,
      req,
      res,
    };
  } catch (e) {
    await log("Error in withAuthorization");
    return {
      req,
      res,
    };
  }
};

export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create({
  allowOutsideOfServer: true,
  isServer: true,
});

export const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const tryAuth = t.middleware(({ next, ctx }) => {
  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const attemptAuthProcedure = t.procedure.use(tryAuth);
