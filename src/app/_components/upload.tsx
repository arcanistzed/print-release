"use client";

import { api } from "~/trpc/react";

const Upload = () => {
	const uploadUrl = api.print.getUploadUrl.useMutation();
	const createJob = api.jobs.create.useMutation();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// Get the form data and validate it
		const form = event.currentTarget;
		const formData = new FormData(form);
		const copies = Number(formData.get("copies")) || 1;
		const duplex = Boolean(formData.get("duplex"));
		const bw = Boolean(formData.get("bw"));
		const file = formData.get("file");

		console.info("Form data:", { copies, duplex, bw });

		if (!file || !(file instanceof File)) {
			console.error("File is required");
			return;
		}

		// Create the job
		let job;
		try {
			job = await createJob.mutateAsync({
				name: file.name,
				copies,
				duplex,
				bw,
			});

			if (!job) {
				console.error("Failed to create job");
				return;
			}

			console.info("Job created:", job);
		} catch (error) {
			console.error("An error occurred during the job creation process:", error);
		}

		if (!job) {
			return;
		}

		// Upload the file to S3
		try {
			const presignedUrl = await uploadUrl.mutateAsync(`${job.id}-${file.name}.${file.type}`);
			if (!presignedUrl) {
				console.error("Failed to fetch the presigned URL.");
				return;
			}

			console.info("Presigned URL fetched:", presignedUrl);

			const uploadResponse = await fetch(presignedUrl, {
				method: "PUT",
				body: file,
			});

			if (!uploadResponse.ok) {
				console.error("Failed to upload file to S3");
				return;
			}

			console.info("File successfully uploaded to S3");
		} catch (error) {
			console.error("An error occurred during the upload process:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid gap-4 grid-cols-2 max-w-md">
			<label htmlFor="copies">Number of Copies</label>
			<input
				id="copies"
				name="copies"
				type="number"
				min="1"
				defaultValue="1"
				className="border rounded px-2 py-1"
			/>
			<label htmlFor="duplex">Duplex</label>
			<input id="duplex" name="duplex" type="checkbox" className="h-4 w-4" />
			<label htmlFor="bw">Black & White</label>
			<input id="bw" name="bw" type="checkbox" className="h-4 w-4" />
			<input id="file" name="file" type="file" accept="application/pdf" className="background-none col-span-2 border-dotted border-4 border-gray-300 rounded p-4 file:hidden" />
			<button type="submit" className="border rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white w-full col-span-2">
				Submit
			</button>
		</form>
	);
};

export default Upload;
