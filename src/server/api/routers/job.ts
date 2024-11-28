import { z } from "zod";
import * as pdfjsLib from "pdfjs-dist";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generatePresignedUrl } from "~/server/utils";

export const jobRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				pages: z.number(),
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
						pages: input.pages,
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

				const presignedUrl = await generatePresignedUrl(job.id, "GET");
				if (!presignedUrl) {
					console.error("Failed to fetch the presigned URL.");
					return;
				}
				const response = await fetch(presignedUrl);
				if (!response.ok) {
					console.error("Failed to fetch the file from S3");
					return;
				}
				console.info("File fetched from S3");

				// Count the number of pages in the PDF
				const data = await response.arrayBuffer();
				const pdf = await pdfjsLib.getDocument(data).promise;
				const pages = pdf.numPages;
				if (pages !== job.pages) {
					console.error("The number of pages in the PDF does not match the job details");
					return;
				}

				return job;
			} catch (error) {
				console.error("An error occurred during the job creation process:", error);
			}
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.job.findMany();
	}),
});
