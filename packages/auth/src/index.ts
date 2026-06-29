import { createPrismaClient } from "@brigada/db";
import { env } from "@brigada/env/server";
import { getDomains } from "@brigada/utils/constants/applications";
import { APP_DOMAIN, APP_NAME } from "@brigada/utils/constants/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { multiSession, openAPI } from "better-auth/plugins";

export function createAuth() {
	const isProduction = env.NODE_ENV === "production";

	const prisma = createPrismaClient();
	const trustedOrigins = getDomains("client");

	return betterAuth({
		appName: APP_NAME,
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,

		database: prismaAdapter(prisma, {
			provider: "postgresql",
		}),

		trustedOrigins,
		emailAndPassword: {
			enabled: false,
		},
		socialProviders: {
			discord: {
				clientId: env.DISCORD_CLIENT_ID,
				clientSecret: env.DISCORD_CLIENT_SECRET,
				scope: [
					"email",
					"identify",
					"guilds",
					"guilds.members.read",
					"guilds.channels.read",
					"dm_channels.messages.write",
				],
				mapProfileToUser: ({ id, email, username }) => ({
					email: email ?? `${id}@discord.placeholder.local`,
					username: username,
				}),
			},
		},

		experimental: {
			joins: true,
		},

		user: {
			additionalFields: {
				role: {
					type: "string",
					input: false,
					required: true,
				},
				username: {
					type: "string",
					unique: true,
					required: true,
				},
			},
		},

		advanced: {
			defaultCookieAttributes: {
				sameSite: isProduction ? "none" : "lax",
				secure: true,
				httpOnly: true,
			},
			cookiePrefix: `${APP_NAME.toLowerCase()}_`,
			crossSubDomainCookies: {
				enabled: true,
				domain: APP_DOMAIN,
			},
			useSecureCookies: isProduction,
		},
		plugins: [multiSession(), openAPI()],
	});
}

export const auth = createAuth();
