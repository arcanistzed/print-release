import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Print from "../_components/print";

export const Home = async () => {
	const session = await auth();
	const user = session?.user;

	if (user && user.role !== "ADMIN") {
		console.log(user)
		redirect("/");
	}
	if (!user) {
		redirect("/api/auth/signin");
	}

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center">
				<h1 className="text-4xl font-bold mb-8">Print Jobs</h1>
				<Print />
			</main>
		</HydrateClient>
	);
};

export default Home;
