"use client";

import { ArrowUpRight } from "lucide-react";
import { useCopy } from "@/lib/copy";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchArticles } from "@/lib/api/blog-posts";
import {
	articleHref,
	formatArticleDate,
	getArticleCoverUrl,
	getArticleDateValue,
	getArticleExcerpt,
} from "@/lib/blog/article-utils";
import type { Article } from "@/lib/types/blog";

const RELATED_FETCH_LIMIT = 6;
const RELATED_DISPLAY_LIMIT = 3;

type BlogRelatedProps = {
	currentId: number;
};

/**
 * Shows up to three of the latest articles, excluding the one open.
 * (The articles API has no categories, so related = latest.)
 */
export default function BlogRelated({ currentId }: BlogRelatedProps) {
	const t = useCopy("blog.post");
	const [related, setRelated] = useState<Article[]>([]);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);

	useEffect(() => {
		let cancelled = false;

		async function loadRelated() {
			setStatus("loading");

			try {
				const response = await fetchArticles({
					page: 1,
					limit: RELATED_FETCH_LIMIT,
				});

				if (cancelled) return;

				const others = response.data
					.filter((post) => post.id !== currentId)
					.slice(0, RELATED_DISPLAY_LIMIT);

				setRelated(others);
				setStatus("ready");
			} catch {
				if (!cancelled) {
					setRelated([]);
					setStatus("error");
				}
			}
		}

		void loadRelated();

		return () => {
			cancelled = true;
		};
	}, [currentId]);

	if (status === "error") return null;
	if (status === "ready" && related.length === 0) return null;

	return (
		<section className="blog-related" aria-label={t("related_label")}>
			<p className="blog-related__headline">{t("related_headline")}</p>

			{status === "loading" ? (
				<div className="blog-related__loading" aria-live="polite" aria-busy>
					<span className="sr-only">{t("related_loading")}</span>
					<ul className="blog-related__grid">
						{Array.from({ length: 3 }).map((_, index) => (
							<li key={index}>
								<div className="blog-related-card blog-related-card--skel">
									<div className="blog-skel blog-related-card__media-skel" />
									<div className="blog-skel blog-skel--meta" />
									<div className="blog-skel blog-skel--title-sm" />
								</div>
							</li>
						))}
					</ul>
				</div>
			) : null}

			{status === "ready" && related.length > 0 ? (
				<ul className="blog-related__grid">
					{related.map((post) => {
						const dateLabel = formatArticleDate(getArticleDateValue(post));
						const excerpt = getArticleExcerpt(post);
						const cover = getArticleCoverUrl(post.cover_image);

						return (
							<li key={post.id}>
								<article className="blog-related-card">
									{cover ? (
										<Link
											href={articleHref(post)}
											className="blog-related-card__media"
											tabIndex={-1}
											aria-hidden
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={cover} alt="" loading="lazy" />
										</Link>
									) : (
										<Link
											href={articleHref(post)}
											className="blog-related-card__media blog-related-card__media--fallback"
											tabIndex={-1}
											aria-hidden
										>
											<span className="blog-media-title">{post.title}</span>
										</Link>
									)}

									<div className="blog-related-card__body">
										{dateLabel ? (
											<p className="blog-related-card__date tabular-nums">
												{dateLabel}
											</p>
										) : null}
										<h3 className="blog-related-card__title">
											<Link href={articleHref(post)}>{post.title}</Link>
										</h3>
										{excerpt ? (
											<p className="blog-related-card__excerpt">{excerpt}</p>
										) : null}
										<Link
											href={articleHref(post)}
											className="blog-read-link blog-read-link--compact"
											aria-label={t("related_read", { title: post.title })}
										>
											{t("related_cta")}
											<ArrowUpRight className="size-4" aria-hidden />
										</Link>
									</div>
								</article>
							</li>
						);
					})}
				</ul>
			) : null}
		</section>
	);
}
