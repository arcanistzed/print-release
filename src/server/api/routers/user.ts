import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
	quota: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: {
				id: ctx.session.user.id,
			},
		});
		return user?.quota ?? 0;
	}),
});
