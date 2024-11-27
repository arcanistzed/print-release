import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface Env {
	PRINT_FILES: R2Bucket;
	AUTH_KEY: string;
	ACCOUNT_ID: string;
	ACCESS_KEY_ID: string;
	SECRET_ACCESS_KEY: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const S3 = new S3Client({
			region: "auto",
			endpoint: `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.ACCESS_KEY_ID,
				secretAccessKey: env.SECRET_ACCESS_KEY,
			},
		});

		const url = new URL(request.url);
		const id = url.searchParams.get("id");

		if (!id) {
			return new Response("Bad Request", { status: 400 });
		}

		const options = {
			Bucket: "print-release-files",
			Key: id,
		};
		let command;
		switch (request.method) {
			case "PUT":
				command = new PutObjectCommand(options);
				break;
			case "GET":
				command = new GetObjectCommand(options);
				break;
			default:
				return new Response("Method Not Allowed", {
					status: 405,
					headers: {
						Allow: "PUT, GET",
					},
				});
		}

		const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
		return new Response(signedUrl, { status: 200 });
	},
};
