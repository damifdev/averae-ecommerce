import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getMeasurementPreferences, getPrimarySettings, listApprovedProductReviews, listProducts, listWishlist, updateMeasurementPreferences, updatePrimarySettings } from "./db";
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
  account: router({ primarySettings: protectedProcedure.query(({ ctx }) => getPrimarySettings(ctx.user.id)), updatePrimarySettings: protectedProcedure.input(z.object({ primaryAddressId: z.string().max(120).nullable().optional(), primaryPaymentId: z.string().max(120).nullable().optional() })).mutation(({ ctx, input }) => updatePrimarySettings(ctx.user.id, input)), measurementPreferences: protectedProcedure.query(({ ctx }) => getMeasurementPreferences(ctx.user.id)), updateMeasurementPreferences: protectedProcedure.input(z.object({ measurementPreferences: z.string().max(4000) })).mutation(({ ctx, input }) => updateMeasurementPreferences(ctx.user.id, input.measurementPreferences)) }),
});
export type AppRouter = typeof appRouter;
