import { getBackendUrl } from "@/lib/api/backend";
import type { Article } from "@/lib/types/blog";

/**
 * True for empty / documentation-placeholder image URLs that should never
 * be requested (e.g. CRM seed content using `https://example.com/image.png`).
 */
export function isUnusableArticleImageUrl(
	src: string | null | undefined,
): boolean {
	if (!src) return true;
	const value = src.trim();
	if (!value) return true;

	try {
		const url = new URL(value, "https://invalid.local");
		const host = url.hostname.toLowerCase();
		if (host === "example.com" || host.endsWith(".example.com")) {
			return true;
		}
		if (host === "invalid.local") {
			// Relative / non-absolute — fine to attempt.
			return false;
		}
	} catch {
		return true;
	}

	return false;
}

/**
 * Resolves an article `cover_image` storage key to a public URL.
 * Keys look like `uploads/public/landing-page/articles/uuid-cover.png`
 * and are served at `{BACKEND_URL}/local-bucket/<relativepath>`.
 * Absolute URLs (and data/blob URLs) pass through untouched.
 */
export function getArticleCoverUrl(
	cover: string | null | undefined,
): string | null {
	if (!cover) return null;

	const value = cover.trim();
	if (!value) return null;

	if (
		value.startsWith("data:") ||
		value.startsWith("blob:") ||
		/^https?:\/\//i.test(value)
	) {
		return isUnusableArticleImageUrl(value) ? null : value;
	}

	// Already a public bucket path — just prefix the backend origin.
	if (value.startsWith("/local-bucket/")) {
		return `${getBackendUrl()}${value}`;
	}

	const clean = value.replace(/^\/+/, "");
	// A stored key may already include the public prefix with a leading slash.
	if (clean.startsWith("local-bucket/")) {
		return `${getBackendUrl()}/${clean}`;
	}
	return `${getBackendUrl()}/local-bucket/${clean}`;
}

/**
 * Resolves a markdown/HTML image `src` found inside article `content`.
 * Covers are always storage keys, but inline images can be:
 * - absolute backend/S3 URLs frozen by the CRM at insert time (passthrough),
 * - bare storage keys (`uploads/...`) when the CRM fell back to the raw key,
 * - `/local-bucket/...` public paths,
 * - frontend-relative assets (`/images/...`) or data/blob URLs (passthrough).
 * Only known storage prefixes are pointed at the backend; anything else is
 * left alone so frontend `public/` assets keep resolving against the site.
 */
export function resolveArticleImageUrl(
	src: string | Blob | null | undefined,
): string | null {
	if (!src) return null;
	if (typeof src !== "string") return null;

	const value = src.trim();
	if (!value) return null;

	if (
		value.startsWith("data:") ||
		value.startsWith("blob:") ||
		/^https?:\/\//i.test(value)
	) {
		return isUnusableArticleImageUrl(value) ? null : value;
	}

	if (value.startsWith("/local-bucket/")) {
		return `${getBackendUrl()}${value}`;
	}

	const clean = value.replace(/^\/+/, "");
	if (clean.startsWith("local-bucket/")) {
		return `${getBackendUrl()}/${clean}`;
	}
	if (
		clean.startsWith("uploads/") ||
		clean.startsWith("public/") ||
		clean.startsWith("assets/") ||
		clean.startsWith("recruit/")
	) {
		return `${getBackendUrl()}/local-bucket/${clean}`;
	}

	return value;
}

/** Short card summary (`short_description`) trimmed, or null. */
export function getArticleExcerpt(article: Article): string | null {
	const value = article.short_description;
	if (typeof value === "string" && value.trim()) {
		return value.trim();
	}
	return null;
}

/** Preferred display date: CRM `published_at`. */
export function getArticleDateValue(article: Article): string | null {
	return article.published_at ?? null;
}

/**
 * Formats an ISO date string for display in blog UI.
 */
export function formatArticleDate(
	value: string | null | undefined,
): string | null {
	if (!value) return null;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;

	return new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
}

/** Canonical identifier for links: slug when present, else numeric id. */
export function getArticleSlugOrId(article: Article): string {
	const slug = article.slug?.trim();
	if (slug) return slug;
	return String(article.id);
}

/** Href for the article detail page (`/blogs/post?id=slugOrId`). */
export function articleHref(article: Article): string {
	return `/blogs/post?id=${encodeURIComponent(getArticleSlugOrId(article))}`;
}

/** Href helper when only the slug/id string is known. */
export function articleHrefByKey(slugOrId: string | number): string {
	return `/blogs/post?id=${encodeURIComponent(String(slugOrId))}`;
}
