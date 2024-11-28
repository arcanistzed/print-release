"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

const Print = () => {
	const list = api.jobs.list.useQuery().data ?? [];
	const print = api.print.queue.useMutation();

	const [selected, setSelected] = useState<string[]>([]);

	const handleChangeSelected = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selected = Array.from(event.target.selectedOptions).map(option => option.value);
		setSelected(selected);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		for (const jobId of selected) {
			try {
				const job = await print.mutateAsync(jobId);
				console.info(`Job ${jobId} printed:`, job);
			} catch (error) {
				console.error(`An error occurred while printing job ${jobId}:`, error);
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
			<select multiple value={selected} onChange={handleChangeSelected}>
				{list.map(job => (
					<option key={job.id} value={job.id} className="p-2 hover:bg-gray-100">
						{job.name} ({job.copies} copies) - {job.status} -{" "}
						{job.createdAt.toLocaleString("en-CA", {
							day: "numeric",
							month: "short",
							hour: "numeric",
							minute: "numeric",
							hour12: false,
						})}
						{!job.bw && " - Color"} {job.duplex && " - Duplex"}
					</option>
				))}
			</select>
			<button type="submit" className="border rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white w-full">
				Print
			</button>
		</form>
	);
};

export default Print;
