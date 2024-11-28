import { env } from "~/env";

export const generatePresignedUrl = async (id: string, method: "GET" | "PUT") => {
	const url = new URL(env.S3_URL);
	url.searchParams.set("id", id);
	const response = await fetch(url.toString(), {
		method,
		headers: {
			Authorization: `Bearer ${env.S3_AUTH_KEY}`,
		},
	});

	if (!response.ok) {
		console.error("Failed to generate presigned URL for S3:", response.statusText);
		return;
	}

	return response.text();
};
