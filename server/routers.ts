import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { listApprovedProductReviews, listProducts, listWishlist } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  catalog: router({ list: publicProcedure.query(() => listProducts()) }),
  wishlist: router({ list: protectedProcedure.query(({ ctx }) => listWishlist(ctx.user.id)) }),
  reviews: router({ byProduct: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => listApprovedProductReviews(input.productId)) }),
});
export type AppRouter = typeof appRouter;
