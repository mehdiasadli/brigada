#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const ROOT = resolve(import.meta.dir, "..");

function die(msg: string): never {
	console.error(`✖ ${msg}`);
	process.exit(1);
}

const rawName = process.argv[2];
if (!rawName) {
	die("Usage: bun run generate:package <name>  (kebab-case, e.g. image-utils)");
}

const name = rawName.trim();
if (!NAME_PATTERN.test(name)) {
	die(
		`Invalid package name "${name}". Use lowercase kebab-case (letters, digits, single hyphens), e.g. image-utils.`,
	);
}

const pkgDir = resolve(ROOT, "packages", name);
if (existsSync(pkgDir)) {
	die(`packages/${name} already exists.`);
}

const packageJson = {
	name: `@brigada/${name}`,
	type: "module",
	exports: {
		".": {
			default: "./src/index.ts",
		},
		"./*": {
			default: "./src/*.ts",
		},
	},
	scripts: {},
	dependencies: {
		"@brigada/env": "workspace:*",
		dotenv: "catalog:",
		zod: "catalog:",
	},
	devDependencies: {
		"@brigada/config": "workspace:*",
		typescript: "catalog:",
	},
};

const tsconfig = {
	extends: "@brigada/config/tsconfig.base.json",
	compilerOptions: {
		declaration: true,
		declarationMap: true,
		sourceMap: true,
		outDir: "dist",
		composite: true,
	},
};

mkdirSync(resolve(pkgDir, "src"), { recursive: true });
writeFileSync(
	resolve(pkgDir, "package.json"),
	`${JSON.stringify(packageJson, null, "\t")}\n`,
);
writeFileSync(
	resolve(pkgDir, "tsconfig.json"),
	`${JSON.stringify(tsconfig, null, "\t")}\n`,
);
writeFileSync(resolve(pkgDir, "src/index.ts"), "export {};\n");

console.log(`✓ Scaffolded @brigada/${name} at packages/${name}`);
console.log("→ Running bun install...");

const install = spawnSync("bun", ["install"], { stdio: "inherit", cwd: ROOT });
if (install.status !== 0) {
	die("bun install failed.");
}

console.log(`\n✓ Done. Import from @brigada/${name}/...`);
