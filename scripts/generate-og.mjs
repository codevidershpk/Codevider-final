/**
 * Renders 1200×630 Open Graph images for every page into
 * public/images/og/<route>/og.png (matches getOgImagePath in lib/site.ts).
 *
 * Usage: node scripts/generate-og.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BLUE = "#2469ff";
const MINT = "#32fcb6";
const BG = "#070b16";

/** Fetches a static TTF from Google Fonts (old UA forces truetype). */
async function loadFont(family, weight) {
	const css = await fetch(
		`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
		{
			headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534" },
		},
	).then((r) => r.text());
	const url = css.match(/src: url\((.+?)\)/)?.[1];
	if (!url) throw new Error(`Font not found: ${family} ${weight}`);
	return fetch(url).then((r) => r.arrayBuffer());
}

/** One card per route in OG_ROUTES (lib/site.ts); `slug: ""` is home. */
const PAGES = [
	{
		slug: "",
		label: "Software development partner",
		lines: ["Your strategic partner", "in software."],
		sub: "Senior engineers building AI, web, mobile, and cloud products.",
	},
	{
		slug: "about",
		label: "About us",
		lines: ["Crafting software", "that means business."],
		sub: "Strategy, design, and engineering in harmony. Tirana, since 2019.",
	},
	{
		slug: "services",
		label: "Services",
		lines: ["Services that move", "your roadmap forward."],
		sub: "Custom software, AI integration, cloud, and team augmentation.",
	},
	{
		slug: "vibe-code-rescue",
		label: "Vibe-Code Rescue",
		lines: ["We fix", "vibe-coded apps."],
		sub: "From AI-generated prototype to production software.",
	},
	{
		slug: "career",
		label: "Careers",
		lines: ["Be part of our", "exceptional team."],
		sub: "Help build the future of software development with us.",
	},
	{
		slug: "blogs",
		label: "Blogs",
		lines: ["Notes on tech,", "work, and people."],
		sub: "Engineering, AI, product craft, teamwork, and career growth.",
	},
	{
		slug: "uk",
		label: "The Business Show London · 11–12 Nov 2026",
		lines: ["Meet us at", "Stand B1350."],
		sub: "ExCeL London. Senior engineers, AI agents, vibe-code rescue.",
	},
	{
		slug: "privacy",
		label: "Legal",
		lines: ["Privacy Policy"],
		sub: "How we collect, use, and protect personal data.",
	},
	{
		slug: "terms",
		label: "Legal",
		lines: ["Terms of Service"],
		sub: "The terms governing our website and services.",
	},
];

function card({ label, lines, sub }, logo) {
	// Shrink the headline so the longest line fits the 1040px content width
	// (Alexandria Bold averages ~0.56em per character).
	const longest = Math.max(...lines.map((line) => line.length));
	const fontSize = Math.min(96, Math.floor(1040 / (longest * 0.56)));
	return h(
		"div",
		{
			style: {
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "72px 80px",
				background: `radial-gradient(circle at 88% 12%, ${BLUE}55, transparent 55%), radial-gradient(circle at 8% 110%, ${MINT}30, transparent 50%), ${BG}`,
				color: "#fff",
				fontFamily: "Alexandria",
			},
		},
		h("img", { src: logo, height: 44, width: 178 }),
		h(
			"div",
			{ style: { display: "flex", flexDirection: "column" } },
			h(
				"div",
				{
					style: {
						display: "flex",
						fontSize: 26,
						fontWeight: 500,
						color: MINT,
						letterSpacing: "0.02em",
						marginBottom: 20,
					},
				},
				label,
			),
			...lines.map((line) =>
				h(
					"div",
					{
						style: {
							fontSize,
							fontWeight: 700,
							whiteSpace: "nowrap",
							lineHeight: 1.02,
							letterSpacing: "-0.035em",
						},
					},
					line,
				),
			),
			h(
				"div",
				{
					style: {
						fontSize: 30,
						marginTop: 28,
						color: "rgba(255,255,255,0.72)",
					},
				},
				sub,
			),
		),
		h(
			"div",
			{
				style: {
					display: "flex",
					fontSize: 24,
					color: "rgba(255,255,255,0.55)",
				},
			},
			"codevider.com",
		),
	);
}

const [regular, medium, bold, logoSvg] = await Promise.all([
	loadFont("Alexandria", 400),
	loadFont("Alexandria", 500),
	loadFont("Alexandria", 700),
	readFile(path.join(root, "public/images/logo/codevider/codevider-logo.svg")),
]);
// Satori ignores <style> inside SVGs, so inline the class fills.
const logo = `data:image/svg+xml;base64,${Buffer.from(
	logoSvg
		.toString()
		.replace(/class="cls-1"/g, 'fill="url(#radial-gradient)"')
		.replace(/class="cls-2"/g, 'fill="#fff"')
		.replace("<svg ", `<svg fill="#fff" `),
).toString("base64")}`;

for (const page of PAGES) {
	const res = new ImageResponse(card(page, logo), {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Alexandria", data: regular, weight: 400 },
			{ name: "Alexandria", data: medium, weight: 500 },
			{ name: "Alexandria", data: bold, weight: 700 },
		],
	});
	const out = path.join(root, "public/images/og", page.slug, "og.png");
	await mkdir(path.dirname(out), { recursive: true });
	await writeFile(out, Buffer.from(await res.arrayBuffer()));
	console.log("wrote", path.relative(root, out));
}
