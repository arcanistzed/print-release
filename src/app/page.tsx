import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

import Upload from "./_components/upload";

const Home = async () => {
	const session = await auth();
	const quota = await api.user.quota();

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center gap-4">
				<Link href={session ? "/api/auth/signout" : "/api/auth/signin"} className="border rounded px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white">
					{session ? "Sign out" : "Sign in"}
				</Link>
				{session?.user ? (
					<div>
						<h1>Welcome {session.user.name}</h1>
					</div>
				) : (
					<div>
						<h1>Welcome to the Print Release App</h1>
					</div>
				)}
				<p>Quota: {quota}</p>
				<Upload />
			</main>
		</HydrateClient>
	);
};

export default Home;
