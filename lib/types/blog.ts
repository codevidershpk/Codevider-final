import type { PaginatedMeta } from "@/lib/types/recruit";

/** Status values for landing-page articles (CRM-managed). */
export type ArticleStatus = "draft" | "published" | "scheduled";

/**
 * Article object returned by the public landing-page articles API.
 * `GET /landing-page/articles` and `GET /landing-page/articles/:slugOrId`.
 * Only `published` articles are visible without auth.
 */
export type Article = {
	id: number;
	title: string;
	slug: string;
	short_description: string | null;
	/** Markdown source rendered by the website. */
	content: string;
	/**
	 * Storage key e.g. `uploads/public/landing-page/articles/uuid-cover.png`.
	 * Resolve via `getArticleCoverUrl()`. Served publicly at
	 * `{BACKEND_URL}/local-bucket/<relativepath>`.
	 */
	cover_image: string | null;
	status: ArticleStatus;
	/** Public display date set in CRM when the article is published. */
	published_at: string | null;
};

/** Paginated articles list response. */
export type ArticlesResponse = {
	data: Article[];
	meta: PaginatedMeta;
};

/**
 * Query parameters for the public articles list endpoint.
 * `search` matches title, summary, and content.
 */
export type ArticlesQuery = {
	page?: number;
	limit?: number;
	search?: string;
};
