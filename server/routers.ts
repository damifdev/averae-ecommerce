import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getPrimarySettings, listApprovedProductReviews, listProducts, listWishlist, updatePrimarySettings } from "./db";
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
  account: router({ primarySettings: protectedProcedure.query(({ ctx }) => getPrimarySettings(ctx.user.id)), updatePrimarySettings: protectedProcedure.input(z.object({ primaryAddressId: z.string().max(120).nullable().optional(), primaryPaymentId: z.string().max(120).nullable().optional() })).mutation(({ ctx, input }) => updatePrimarySettings(ctx.user.id, input)) }),
});
export type AppRouter = typeof appRouter;
