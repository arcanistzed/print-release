import ipp, { type PrintJobRequest } from "ipp";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generatePresignedUrl } from "~/server/utils";

const printer = new ipp.Printer("http://localhost:631/printers/XP-320");

export const printRouter = createTRPCRouter({
	getUploadUrl: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
		return generatePresignedUrl(input, "PUT");
	}),

	queue: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
		const presignedUrl = await generatePresignedUrl(input, "GET");

		if (!presignedUrl) {
			console.error("Failed to fetch the presigned URL.");
			return;
		}

		const response = await fetch(presignedUrl);
		const arrayBuffer = await response.arrayBuffer();

		const message = {
			"operation-attributes-tag": {
				"requesting-user-name": "Admin",
				"job-name": "Print Job",
				"document-format": "application/pdf",
			},
			data: Buffer.from(arrayBuffer),
		} as PrintJobRequest;

		return new Promise((resolve, reject) => {
			printer.execute("Print-Job", message, (error, response) => {
				if (error) {
					console.error(error);
					reject(error);
				} else {
					console.log(response);
					resolve(response);
				}
			});
		});
	}),
});
