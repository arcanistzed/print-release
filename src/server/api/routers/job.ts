import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const jobRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				copies: z.number(),
				duplex: z.boolean(),
				bw: z.boolean(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const job = await ctx.db.job.create({
					data: {
						name: input.name,
						status: "QUEUED",
						copies: input.copies,
						duplex: input.duplex,
						bw: input.bw,
						user: {
							connect: {
								id: ctx.session.user.id,
							},
						},
					},
				});
				console.info("Job created:", job);
				return job;
			} catch (error) {
				console.error("An error occurred during the job creation process:", error);
			}
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.job.findMany();
	}),
});
