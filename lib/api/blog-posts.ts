import { getBackendUrl } from "@/lib/api/backend";
import type {
	Article,
	ArticlesQuery,
	ArticlesResponse,
} from "@/lib/types/blog";

/**
 * Fetches paginated published articles from the public landing-page API.
 * `GET /landing-page/articles?page=&limit=&search=`
 * `search` matches title, summary, and content.
 */
export async function fetchArticles(
	query: ArticlesQuery = {},
): Promise<ArticlesResponse> {
	const params = new URLSearchParams();

	if (query.page !== undefined) {
		params.set("page", String(query.page));
	}

	if (query.limit !== undefined) {
		params.set("limit", String(query.limit));
	}

	if (query.search?.trim()) {
		params.set("search", query.search.trim());
	}

	const search = params.toString();
	const response = await fetch(
		`${getBackendUrl()}/landing-page/articles${search ? `?${search}` : ""}`,
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch articles (${response.status})`);
	}

	return response.json() as Promise<ArticlesResponse>;
}

/**
 * Fetches a single published article by numeric id or slug.
 * `GET /landing-page/articles/:slugOrId` — 404 unless published.
 */
export async function fetchArticleBySlugOrId(
	slugOrId: string | number,
): Promise<Article> {
	const key =
		typeof slugOrId === "number"
			? String(slugOrId)
			: String(slugOrId).trim();

	if (!key) {
		throw new Error("Missing article id or slug");
	}

	const response = await fetch(
		`${getBackendUrl()}/landing-page/articles/${encodeURIComponent(key)}`,
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch article (${response.status})`);
	}

	return response.json() as Promise<Article>;
}
