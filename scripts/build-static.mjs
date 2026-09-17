import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
if (!backendUrl.trim()) {
	console.error(
		"ERROR: NEXT_PUBLIC_BACKEND_URL is not set.\n" +
			"It is baked into the static export at build time and is used for\n" +
			"blog API calls and cover/inline image URLs.\n" +
			"Example: NEXT_PUBLIC_BACKEND_URL=https://api.codevider.com npm run build:static",
	);
	process.exit(1);
}
if (/localhost|127\.0\.0\.1|192\.168\./i.test(backendUrl)) {
	console.warn(
		`WARNING: building static export with a local backend URL (${backendUrl}).\n` +
			"Blog data and images will not load on the deployed site.\n" +
			"For production use a public API origin, e.g. NEXT_PUBLIC_BACKEND_URL=https://api.codevider.com",
	);
}

execSync("next build", {
	stdio: "inherit",
	cwd: root,
});
