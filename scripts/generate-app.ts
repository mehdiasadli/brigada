#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const DEFAULT_PORT = 3001;
const PORT_MIN = 1024;
const PORT_MAX = 65535;
const RESERVED_PORTS = new Set([3000]); // apps/server

const ROOT = resolve(import.meta.dir, "..");
const TEMPLATE_DIR = resolve(import.meta.dir, "templates/app");
const ENV_TEMPLATE = resolve(import.meta.dir, "templates/env-app.ts");

function die(msg: string): never {
	console.error(`✖ ${msg}`);
	process.exit(1);
}

// --- args ---
const rawName = process.argv[2];
const rawPort = process.argv[3];

if (!rawName) {
	die(
		"Usage: bun run generate:app <name> [port]  (kebab-case, e.g. eats 3002)",
	);
}

const name = rawName.trim();
if (!NAME_PATTERN.test(name)) {
	die(
		`Invalid app name "${name}". Use lowercase kebab-case (letters, digits, single hyphens), e.g. eats.`,
	);
}

let port = DEFAULT_PORT;
if (rawPort !== undefined) {
	const parsed = Number(rawPort);
	if (!Number.isInteger(parsed) || parsed < PORT_MIN || parsed > PORT_MAX) {
		die(
			`Invalid port "${rawPort}". Provide an integer in [${PORT_MIN}, ${PORT_MAX}].`,
		);
	}
	port = parsed;
}

// --- collision checks ---
const appDir = resolve(ROOT, "apps", name);
if (existsSync(appDir)) {
	die(`apps/${name} already exists.`);
}

const envFile = resolve(ROOT, "packages/env/src", `${name}.ts`);
if (existsSync(envFile)) {
	die(`packages/env/src/${name}.ts already exists.`);
}

const portsInUse = collectPortsInUse();
if (RESERVED_PORTS.has(port) || portsInUse.has(port)) {
	const owner = RESERVED_PORTS.has(port)
		? "apps/server"
		: (portsInUse.get(port) ?? "another app");
	die(
		`Port ${port} is already used by ${owner}. Pick a different port: bun run generate:app ${name} <port>.`,
	);
}

// --- scaffold ---
const replacements: Record<string, string> = {
	__APP_NAME__: name,
	__PORT__: String(port),
	__SERVICE_NAME__: `brigada-${name}`,
};

copyTemplateTree(TEMPLATE_DIR, appDir, replacements);
renameDotfiles(appDir);

mkdirSync(dirname(envFile), { recursive: true });
writeFileSync(
	envFile,
	applyReplacements(readFileSync(ENV_TEMPLATE, "utf8"), replacements),
);

addEnvSubpathExport(name);
addAppToApplicationsConstants(name, port);

console.log(`✓ Scaffolded apps/${name} (port ${port})`);
console.log(`✓ Created packages/env/src/${name}.ts`);
console.log(`✓ Added "./${name}" to @brigada/env exports`);
console.log(`✓ Registered "${name}" in @brigada/utils/constants/applications`);
console.log("→ Running bun install...");

const install = spawnSync("bun", ["install"], { stdio: "inherit", cwd: ROOT });
if (install.status !== 0) {
	die("bun install failed.");
}

console.log(`\n✓ Done. Start the dev server: bun -F ${name} dev`);
console.log(`  App will run at http://localhost:${port}`);

// --- helpers ---
type Replacements = Record<string, string>;

function applyReplacements(
	content: string,
	replacements: Replacements,
): string {
	let out = content;
	for (const [key, value] of Object.entries(replacements)) {
		out = out.split(key).join(value);
	}
	return out;
}

function copyTemplateTree(
	src: string,
	dest: string,
	replacements: Replacements,
): void {
	mkdirSync(dest, { recursive: true });
	for (const entry of readdirSync(src)) {
		const srcPath = join(src, entry);
		const destPath = join(dest, entry);
		const st = statSync(srcPath);
		if (st.isDirectory()) {
			copyTemplateTree(srcPath, destPath, replacements);
		} else {
			const content = readFileSync(srcPath, "utf8");
			writeFileSync(destPath, applyReplacements(content, replacements));
		}
	}
}

function renameDotfiles(dir: string): void {
	// Templates store .env as _env and .gitignore as _gitignore to avoid being
	// matched by root .gitignore. Rename to the real dotfile names after copy.
	const map: Record<string, string> = {
		_env: ".env",
		_gitignore: ".gitignore",
	};
	for (const [from, to] of Object.entries(map)) {
		const src = join(dir, from);
		if (existsSync(src)) {
			renameSync(src, join(dir, to));
		}
	}
}

function addEnvSubpathExport(appName: string): void {
	const pkgPath = resolve(ROOT, "packages/env/package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
		exports?: Record<string, string>;
		[key: string]: unknown;
	};
	if (!pkg.exports) pkg.exports = {};
	const key = `./${appName}`;
	if (pkg.exports[key]) {
		// Should be impossible given the earlier collision check, but stay defensive.
		return;
	}
	pkg.exports[key] = `./src/${appName}.ts`;
	writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function addAppToApplicationsConstants(appName: string, appPort: number): void {
	const filePath = resolve(
		ROOT,
		"packages/utils/src/constants/applications.ts",
	);
	let content = readFileSync(filePath, "utf8");

	const subdomainsRe = /(export const subdomains = \[)([^\]]*)(\] as const;)/;
	const subMatch = content.match(subdomainsRe);
	if (!subMatch) {
		die(
			"Could not locate `subdomains` tuple in packages/utils/src/constants/applications.ts.",
		);
	}
	if (subMatch[2].includes(`"${appName}"`)) {
		die(`applications.ts subdomains already contains "${appName}".`);
	}
	content = content.replace(
		subdomainsRe,
		(_match, lead, inner, tail) => `${lead}${inner}, "${appName}"${tail}`,
	);

	const closingRe = /\n\} as const satisfies Record<Subdomain, Application>;/;
	if (!closingRe.test(content)) {
		die(
			"Could not locate `apps` closing line in packages/utils/src/constants/applications.ts.",
		);
	}
	const entry =
		`\t"${appName}": {\n` +
		`\t\tname: "${appName}",\n` +
		`\t\tdescription: "${appName}",\n` +
		`\t\tport: ${appPort},\n` +
		`\t\tvariant: "client",\n` +
		"\t},\n";
	content = content.replace(
		closingRe,
		`\n${entry}} as const satisfies Record<Subdomain, Application>;`,
	);

	writeFileSync(filePath, content);
}

function collectPortsInUse(): Map<number, string> {
	const ports = new Map<number, string>();
	const appsDir = resolve(ROOT, "apps");
	if (!existsSync(appsDir)) return ports;
	for (const entry of readdirSync(appsDir)) {
		const pkgPath = resolve(appsDir, entry, "package.json");
		if (!existsSync(pkgPath)) continue;
		try {
			const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
				scripts?: Record<string, string>;
			};
			const dev = pkg.scripts?.dev;
			if (!dev) continue;
			const match = dev.match(/--port\s+(\d+)/);
			if (match) ports.set(Number(match[1]), `apps/${entry}`);
		} catch {
			// ignore malformed package.json
		}
	}
	return ports;
}
