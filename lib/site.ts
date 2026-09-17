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
] as const;

/** List of pages that have custom Open Graph images. */
export const OG_PAGES = [
	"home",
	"about",
	"services",
	"career",
	"blog",
	"privacy",
	"terms",
] as const;

/** Type representing a page that has a custom Open Graph image. */
export type OgPage = (typeof OG_PAGES)[number];

/** Maps OG page keys to their corresponding site routes. */
const OG_PAGE_TO_ROUTE: Record<OgPage, (typeof SITE_ROUTES)[number]> = {
	home: "",
	about: "/about",
	services: "/services",
	career: "/career",
	blog: "/blogs",
	privacy: "/privacy",
	terms: "/terms",
};

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
 * Gets the path to the Open Graph image for a page.
 */
export function getOgImagePath(page: OgPage): string {
	return `/images/og/english/${page}/og.png`;
}

/**
 * Gets the full URL to the Open Graph image for a page.
 */
export function getOgImageUrl(page: OgPage): string {
	return `${getSiteUrl()}${getOgImagePath(page)}`;
}

/** Input options for creating page metadata. */
type PageMetadataInput = {
	title: string;
	description: string;
	page: OgPage;
	path?: string;
};

/**
 * Creates Next.js Metadata for a page.
 */
export function createPageMetadata({
	title,
	description,
	page,
	path: pathOverride,
}: PageMetadataInput): Metadata {
	const siteRoute = OG_PAGE_TO_ROUTE[page];
	const canonical = pathOverride
		? getPageUrl(pathOverride)
		: getPageUrl(siteRoute);
	const ogImageUrl = getOgImageUrl(page);

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
