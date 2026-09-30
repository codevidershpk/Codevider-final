import type { Metadata } from "next";

/** Production fallback when NEXT_PUBLIC_SITE_URL is not set at build time. */
export const SITE_URL = "https://www.codevider.com";

/**
 * Canonical origin for metadata, sitemap, and OG image URLs.
 * Set NEXT_PUBLIC_SITE_URL when building for staging or test domains, e.g.
 * NEXT_PUBLIC_SITE_URL=https://staging.example.com npm run build
 */
export function getSiteUrl(): string {
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
	}

	if (process.env.NODE_ENV === "development") {
		return `http://localhost:${process.env.PORT ?? "3000"}`;
	}

	return SITE_URL;
}

/** List of all site routes. */
export const SITE_ROUTES = [
	"",
	"/about",
	"/services",
	"/career",
	"/blogs",
	"/privacy",
	"/terms",
	"/vibe-code-rescue",
	"/uk",
] as const;

/** A site route path. */
export type SiteRoute = (typeof SITE_ROUTES)[number];

/**
 * Routes with their own image at `public/images/og/<route>/og.png`
 * (home lives at `public/images/og/og.png`). Other paths fall back to the
 * nearest ancestor route listed here, then to home.
 */
const OG_ROUTES: ReadonlySet<string> = new Set<SiteRoute>([
	"",
	"/about",
	"/services",
	"/career",
	"/blogs",
	"/privacy",
	"/terms",
	"/vibe-code-rescue",
	"/uk",
]);

/**
 * Builds a fully qualified URL for a site path.
 */
export function getPageUrl(
	path: (typeof SITE_ROUTES)[number] | string,
): string {
	const base = getSiteUrl();
	if (path === "" || path === "/") {
		return base;
	}
	return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Gets the path to the Open Graph image for a route.
 */
export function getOgImagePath(path: string): string {
	let route = path === "/" ? "" : path.replace(/\/$/, "");
	while (route && !OG_ROUTES.has(route)) {
		route = route.slice(0, route.lastIndexOf("/"));
	}
	return `/images/og${route}/og.png`;
}

/**
 * Gets the full URL to the Open Graph image for a route.
 */
export function getOgImageUrl(path: string): string {
	return `${getSiteUrl()}${getOgImagePath(path)}`;
}

/** Input options for creating page metadata. */
type PageMetadataInput = {
	title: string;
	description: string;
	/** Route path, e.g. `/about`; `""` for home. Drives canonical and OG image. */
	path: SiteRoute | string;
};

/**
 * Creates Next.js Metadata for a page.
 */
export function createPageMetadata({
	title,
	description,
	path,
}: PageMetadataInput): Metadata {
	const canonical = getPageUrl(path);
	const ogImageUrl = getOgImageUrl(path);

	return {
		title,
		description,
		alternates: {
			canonical,
		},
		openGraph: {
			title,
			description,
			url: canonical,
			siteName: "Codevider",
			locale: "en_US",
			type: "website",
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: title,
					type: "image/png",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImageUrl],
		},
	};
}
