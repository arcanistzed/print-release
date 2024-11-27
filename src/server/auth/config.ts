import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: "ADMIN" | "STUDENT";
			// ...other properties
		} & DefaultSession["user"];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [GitHubProvider],
	adapter: PrismaAdapter(db),
	callbacks: {
		async session({ session, user }) {
			const newSession = await db.user.findUnique({
				where: { id: user.id },
				select: {
					id: true,
					role: true,
				},
			});

			return {
				...session,
				user: {
					...session.user,
					id: newSession?.id,
					role: newSession?.role === "ADMIN" ? "ADMIN" : "STUDENT",
				},
			};
		},
	},
} satisfies NextAuthConfig;
