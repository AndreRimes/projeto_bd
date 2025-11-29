import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { postoRouter } from "./posto/route";
import { profissionalRouter } from "./profissional/routes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posto: postoRouter,
  profissional: profissionalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
