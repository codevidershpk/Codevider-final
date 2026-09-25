#!/usr/bin/env node
/**
 * Generates brand-duotone versions of the technology icons.
 *
 *   public/icons/technologies/<cat>/<name>.svg            (originals, never modified)
 *   → public/icons/technologies-duotone/<cat>/<name>.svg       (light theme)
 *   → public/icons/technologies-duotone/<cat>/<name>.dark.svg  (dark theme)
 *   → public/icons/technologies-duotone/_preview.html          (contact sheet)
 *
 * Colours come from design.md / app/globals.css. The icons are rendered via <img>,
 * so CSS variables can't reach them; the token values are baked in per theme.
 *
 * Mapping, per icon:
 *   - near-white          → knockout (white in light, --surface in dark)
 *   - remaining colours, sorted by luminance:
 *       darkest half      → --brand-blue            ("accent")
 *       lighter half      → brand-blue mixed into the tile surface ("accent-light")
 *   - single-colour icons → accent
 *   - gradients: their stops are remapped the same way
 *   - currentColor / unspecified fill (SVG default black) → accent
 *
 * Usage: node scripts/generate-duotone-icons.mjs
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/icons/technologies");
const OUT = path.join(ROOT, "public/icons/technologies-duotone");

// Tokens from design.md (Colour table).
const THEMES = {
	// accent-light = accent mixed toward `tint` (`mix` = share of accent). Light mode
	// tints toward the surface (paler); dark mode tints toward white so the light
	// parts of a logo stay the brightest instead of sinking into the background.
	light: {
		accent: "#2469ff",
		// knockout = --svc-tech-icon-bg, so logo cut-outs blend into the icon chip.
		surface: "#ebf1ff",
		knockout: "#ebf1ff",
		tint: "#ffffff",
		mix: 0.45,
	},
	dark: {
		accent: "#7a9feb",
		surface: "#1c1f2a",
		knockout: "#1c1f2a",
		tint: "#ffffff",
		mix: 0.45,
	},
};
const KNOCKOUT_LUMINANCE = 0.85;

// Hand-tuned roles, keyed by path relative to SRC, then theme, then source colour.
// Use when the automatic split leaves the main shape too pale.
const OVERRIDES = {
	// Plain shield with the "5" cut out (chip colour, so it reads as empty space).
	"frontend/html.svg": {
		light: {
			"#e44d26": "accent",
			"#f16529": "accent",
			"#ebebeb": "knockout",
			"#ffffff": "knockout",
		},
		dark: {
			"#e44d26": "accent",
			"#f16529": "accent",
			"#ebebeb": "knockout",
			"#ffffff": "knockout",
		},
	},
	// Single colour: the gradient shield reads better flat.
	"frontend/angular.svg": {
		light: {
			"#7702ff": "accent",
			"#cc26d5": "accent",
			"#f0060b": "accent",
			"#ff41f8": "accent",
		},
	},
	// Face one colour, hands another; eyes and mouth cut out.
	"ai/huggingface.svg": {
		dark: {
			"#ffd21e": "accent",
			"#ff9d0b": "accentLight",
			"#3a3b45": "knockout",
			"#ff323d": "knockout",
		},
	},
	// Stray black/grey in unused markup outranks the blue wheel.
	"cloud_devops/kubernetes.svg": { light: { "#326ce5": "accent" } },
	"databases/postgres.svg": { light: { "#336791": "accent" } },
	// Solid blue badge with white "JS", instead of pale badge + blue text.
	"frontend/javascript.svg": {
		light: { "#f0db4f": "accent", "#323330": "knockout" },
		dark: { "#f0db4f": "accent", "#323330": "knockout" },
	},
};

// ---------- colour utils ----------

const NAMED = {
	white: "#ffffff",
	black: "#000000",
	red: "#ff0000",
	blue: "#0000ff",
	green: "#008000",
	gray: "#808080",
	grey: "#808080",
	yellow: "#ffff00",
	orange: "#ffa500",
	purple: "#800080",
};

// Matches a colour value token: hex, rgb()/rgba(), or a known name.
const COLOR_RE = new RegExp(
	`#[0-9a-f]{8}\\b|#[0-9a-f]{6}\\b|#[0-9a-f]{3,4}\\b|rgba?\\([^)]*\\)|\\b(?:${Object.keys(NAMED).join("|")})\\b`,
	"gi",
);

function parseColor(raw) {
	const v = raw.trim().toLowerCase();
	if (NAMED[v]) return parseColor(NAMED[v]);
	let m = v.match(/^#([0-9a-f]{3,8})$/);
	if (m) {
		let h = m[1];
		if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
		};
	}
	m = v.match(/^rgba?\(([^)]*)\)$/);
	if (m) {
		const [r, g, b] = m[1].split(/[\s,/]+/).map(Number);
		return { r, g, b };
	}
	return null;
}

const key = ({ r, g, b }) =>
	`#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;

function luminance({ r, g, b }) {
	const lin = (c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function mix(a, b, t) {
	const A = parseColor(a);
	const B = parseColor(b);
	return key({
		r: A.r * t + B.r * (1 - t),
		g: A.g * t + B.g * (1 - t),
		b: A.b * t + B.b * (1 - t),
	});
}

// ---------- svg handling ----------

// Colour-bearing places: presentation attributes, style="", and <style> blocks.
const ATTR_RE =
	/\b(fill|stroke|stop-color|flood-color|lighting-color|color)\s*=\s*(["'])(.*?)\2/gi;
const STYLE_ATTR_RE = /\bstyle\s*=\s*(["'])(.*?)\1/gis;
const STYLE_TAG_RE = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi;
const DECL_RE =
	/\b(fill|stroke|stop-color|flood-color|lighting-color|color)\s*:\s*([^;}"']+)/gi;

function collectColors(svg) {
	const found = new Map();
	const add = (value) => {
		for (const tok of value.replace(/url\([^)]*\)/gi, "").match(COLOR_RE) ??
			[]) {
			const c = parseColor(tok);
			if (c) found.set(key(c), c);
		}
	};
	for (const [, , , v] of svg.matchAll(ATTR_RE)) add(v);
	for (const [, , style] of svg.matchAll(STYLE_ATTR_RE))
		for (const [, , v] of style.matchAll(DECL_RE)) add(v);
	for (const [, , css] of svg.matchAll(STYLE_TAG_RE))
		for (const [, , v] of css.matchAll(DECL_RE)) add(v);
	// Shapes with no fill of their own (and no group/CSS fill to inherit) render
	// in SVG's default black; count it as an ink so it gets a role.
	const root = svg.match(/<svg\b[^>]*>/i)?.[0] ?? "";
	const inheritsFill =
		/\sfill\s*=/.test(root) ||
		/<g\b[^>]*\bfill\s*=/i.test(svg) ||
		/<style\b/i.test(svg);
	const bareShape =
		/<(path|rect|circle|ellipse|polygon|polyline)\b(?![^>]*\bfill\s*[=:])[^>]*>/i;
	if (!inheritsFill && bareShape.test(svg) && !found.has("#000000"))
		found.set("#000000", { r: 0, g: 0, b: 0, implicit: true });
	return found;
}

/** Decide role per distinct colour for one icon. */
function buildRoles(colors) {
	const roles = new Map();
	const inks = [];
	for (const [k, c] of colors) {
		// Implicit black often comes from clip paths or helpers, so it's kept out of
		// the ranking; otherwise it would push the real brand colour to accent-light.
		if (c.implicit && colors.size > 1) roles.set(k, "accent");
		else if (luminance(c) >= KNOCKOUT_LUMINANCE) roles.set(k, "knockout");
		else inks.push([k, luminance(c)]);
	}
	inks.sort((a, b) => a[1] - b[1]);
	const split = Math.ceil(inks.length / 2);
	inks.forEach(([k], i) => {
		roles.set(k, i < split ? "accent" : "accentLight");
	});
	// All-white icon (e.g. drawn for dark backgrounds): make it visible.
	const hasImplicit = [...colors.values()].some((c) => c.implicit);
	if (inks.length === 0 && !hasImplicit)
		for (const k of roles.keys()) roles.set(k, "accent");
	return roles;
}

// <mask> contents are luminance data, not visible colour; recolouring them
// (e.g. white → dark surface) would hide the shapes they mask.
const MASK_RE = /(<mask\b[\s\S]*?<\/mask>)/i;

function recolor(svg, roles, palette) {
	const [head, ...rest] = svg.split(MASK_RE);
	if (rest.length)
		return [recolorPart(head, roles, palette)]
			.concat(rest.map((p, i) => (i % 2 ? recolorPart(p, roles, palette) : p)))
			.join("");
	return recolorPart(svg, roles, palette);
}

function recolorPart(svg, roles, palette) {
	// Split out url(#id) references first: ids like #e399c19f look like hex.
	const swap = (value) =>
		value
			.split(/(url\([^)]*\))/i)
			.map((part, i) =>
				i % 2
					? part
					: part.replace(COLOR_RE, (tok) => {
							const c = parseColor(tok);
							const role = c && roles.get(key(c));
							return role ? palette[role] : tok;
						}),
			)
			.join("");
	const swapDecls = (css) =>
		css.replace(DECL_RE, (m, prop, v) => `${prop}:${swap(v)}`);

	let out = svg
		.replace(
			STYLE_TAG_RE,
			(_, open, css, close) => open + swapDecls(css) + close,
		)
		.replace(
			STYLE_ATTR_RE,
			(_, q, style) => `style=${q}${swapDecls(style)}${q}`,
		)
		.replace(ATTR_RE, (_, attr, q, v) => `${attr}=${q}${swap(v)}${q}`);

	// Root defaults: `currentColor` resolves against `color`, and shapes with no
	// fill inherit SVG's default black. Pin both to the accent.
	out = out.replace(/<svg\b[^>]*>/i, (tag) => {
		let t = tag;
		if (!/\scolor\s*=/.test(t))
			t = t.replace(/<svg\b/i, `<svg color="${palette.accent}"`);
		if (!/\sfill\s*=/.test(t))
			t = t.replace(/<svg\b/i, `<svg fill="${palette.accent}"`);
		return t;
	});
	return out;
}

// ---------- main ----------

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(p);
		else if (entry.name.toLowerCase().endsWith(".svg")) yield p;
	}
}

const palettes = Object.fromEntries(
	Object.entries(THEMES).map(([name, t]) => [
		name,
		{
			accent: t.accent,
			accentLight: mix(t.accent, t.tint, t.mix),
			knockout: t.knockout,
			// For OVERRIDES: removes the shape's paint entirely.
			transparent: "none",
		},
	]),
);

await rm(OUT, { recursive: true, force: true });
const rows = [];
for await (const file of walk(SRC)) {
	const rel = path.relative(SRC, file);
	const svg = await readFile(file, "utf8");
	const roles = buildRoles(collectColors(svg));
	const rolesFor = (theme) =>
		new Map([...roles, ...Object.entries(OVERRIDES[rel]?.[theme] ?? {})]);
	const base = path.join(OUT, rel.replace(/\.svg$/i, ""));
	await mkdir(path.dirname(base), { recursive: true });
	await writeFile(
		`${base}.svg`,
		recolor(svg, rolesFor("light"), palettes.light),
	);
	await writeFile(
		`${base}.dark.svg`,
		recolor(svg, rolesFor("dark"), palettes.dark),
	);
	rows.push(rel);
}
rows.sort();

const cell = (src, bg) =>
	`<td style="background:${bg}"><img src="${src}" height="40"></td>`;
const preview = `<!doctype html><meta charset="utf-8"><title>Duotone icons</title>
<style>body{font:14px system-ui;margin:24px}td{padding:10px 16px;text-align:center}code{font-size:12px}</style>
<p>Palette — light: ${Object.values(palettes.light).join(" / ")} · dark: ${Object.values(palettes.dark).join(" / ")}</p>
<table><tr><th>icon</th><th>original</th><th>light</th><th>original</th><th>dark</th></tr>
${rows
	.map((rel) => {
		const d = rel.replace(/\.svg$/i, "");
		return `<tr><td><code>${rel}</code></td>${cell(`../technologies/${rel}`, THEMES.light.surface)}${cell(`${d}.svg`, THEMES.light.surface)}${cell(`../technologies/${rel}`, THEMES.dark.surface)}${cell(`${d}.dark.svg`, THEMES.dark.surface)}</tr>`;
	})
	.join("\n")}
</table>`;
await writeFile(path.join(OUT, "_preview.html"), preview);

console.log(
	`Generated ${rows.length} icons × 2 themes → ${path.relative(ROOT, OUT)}`,
);
console.log("light", palettes.light, "\ndark ", palettes.dark);
