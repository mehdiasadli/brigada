// Applications of the project

import { env } from "@brigada/env/server";
import { APP_DOMAIN } from "./config";

type EnvType = typeof env.NODE_ENV;

export const appVariants = ["client", "server", "bot"] as const;
export type AppVariant = (typeof appVariants)[number];

interface Application {
	name: string;
	description: string;
	port: number; // for local development
	variant: AppVariant;
}

export const subdomains = ["www", "auth", "admin"] as const;
export type Subdomain = (typeof subdomains)[number];

export const apps = {
	www: {
		name: "Brigada",
		description:
			"The flagship social platform for the group — a central feed of posts, member profiles, comments, and reactions.",
		port: 3001,
		variant: "client",
	},
	auth: {
		name: "Auth",
		description:
			"The single front door to all of Brigada. Discord OAuth login with shared sessions across every site.",
		port: 3002,
		variant: "client",
	},
	admin: {
		name: "Admin",
		description:
			"The control room for managing users, content, and platform settings. Gated to moderator roles and above.",
		port: 3003,
		variant: "client",
	},
} as const satisfies Record<Subdomain, Application>;

function createLocalDomain(port: number) {
	return `http://localhost:${port}`;
}

function createDomain(subdomain: Subdomain) {
	return subdomain === "www"
		? `https://${APP_DOMAIN}`
		: `https://${subdomain}.${APP_DOMAIN}`;
}

type VariantFunction = (...variants: AppVariant[]) => string[];

function normalizeVariants(variants: AppVariant[]) {
	const normalized = variants.length > 0 ? variants : appVariants;
	return normalized
		.map((variant) => (appVariants.includes(variant) ? variant : null))
		.filter(Boolean) as AppVariant[];
}

export const domains: Record<EnvType, VariantFunction> = {
	development: (...variants) => {
		const vars = normalizeVariants(variants);

		return Object.values(apps)
			.filter((app) => vars.includes(app.variant))
			.map((app) => createLocalDomain(app.port));
	},
	production: (...variants) => {
		const vars = normalizeVariants(variants);

		return Object.entries(apps)
			.filter(([_, app]) => vars.includes(app.variant))
			.map(([subdomain, _]) => createDomain(subdomain as Subdomain));
	},
};

export function getDomains(...variants: AppVariant[]) {
	return domains[env.NODE_ENV](...variants);
}
