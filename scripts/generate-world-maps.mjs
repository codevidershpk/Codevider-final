/**
 * Regenerates static world-map SVGs for light/dark + compact/default.
 * Run: node scripts/generate-world-maps.mjs
 */
import DottedMapModule from "dotted-map";
import fs from "node:fs";
import path from "node:path";

// dotted-map is CommonJS; its class lands on `.default` under ESM interop.
const DottedMap = DottedMapModule.default ?? DottedMapModule;

const styles = {
	light: { radius: 0.3, color: "#1e3280" },
	dark: { radius: 0.24, color: "#ffffffd9" },
};

const heights = { compact: 55, default: 72 };
const outDir = path.join(process.cwd(), "public/maps");

fs.mkdirSync(outDir, { recursive: true });

for (const [size, height] of Object.entries(heights)) {
	const map = new DottedMap({ height, grid: "diagonal" });
	for (const [theme, opts] of Object.entries(styles)) {
		let svg = map.getSVG({
			radius: opts.radius,
			color: opts.color,
			shape: "circle",
			backgroundColor: "transparent",
		});
		svg = svg.replace(/(\d+\.\d{3})\d+/g, "$1");
		const out = path.join(outDir, `world-${size}-${theme}.svg`);
		fs.writeFileSync(out, svg);
		console.log(
			`${path.relative(process.cwd(), out)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`,
		);
	}
}
