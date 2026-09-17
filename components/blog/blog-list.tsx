"use client";

import {
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Search,
	X,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useCallback, useEffect, useRef, useState } from "react";
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
import type { PaginatedMeta } from "@/lib/types/recruit";

const revealEase = [0.22, 1, 0.36, 1] as const;
const ARTICLES_PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 280;

const initialMeta: PaginatedMeta = {
	page: 1,
	limit: ARTICLES_PAGE_SIZE,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
};

function PostMeta({ post, metaLabel }: { post: Article; metaLabel: string }) {
	const dateLabel = formatArticleDate(getArticleDateValue(post));

	if (!dateLabel) return null;

	return (
		<ul className="blog-meta" aria-label={metaLabel}>
			<li>
				<span className="tabular-nums">{dateLabel}</span>
			</li>
		</ul>
	);
}

function SkeletonBlock({ className }: { className?: string }) {
	return <div className={`blog-skel ${className ?? ""}`} aria-hidden />;
}

export default function BlogList() {
	const t = useCopy("blog.list");
	const ref = useRef<HTMLElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const hasLoadedOnce = useRef(false);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();
	const [posts, setPosts] = useState<Article[]>([]);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);
	const [meta, setMeta] = useState<PaginatedMeta>(initialMeta);
	const [isPageLoading, setIsPageLoading] = useState(false);
	const [titleQuery, setTitleQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	// Public search matches title, summary, and content.
	const search = debouncedQuery.trim();
	const hasActiveFilters = search.length > 0;

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedQuery(titleQuery);
		}, SEARCH_DEBOUNCE_MS);

		return () => window.clearTimeout(timer);
	}, [titleQuery]);

	const fetchList = useCallback(
		async (nextPage: number, nextSearch: string) => {
			const response = await fetchArticles({
				page: nextPage,
				limit: ARTICLES_PAGE_SIZE,
				...(nextSearch ? { search: nextSearch } : {}),
			});
			setPosts(response.data);
			setMeta(response.meta);
		},
		[],
	);

	useEffect(() => {
		let cancelled = false;

		async function loadFiltered() {
			if (hasLoadedOnce.current) {
				setIsPageLoading(true);
			}

			try {
				await fetchList(1, search);
				if (!cancelled) {
					hasLoadedOnce.current = true;
					setStatus("ready");
				}
			} catch {
				if (!cancelled) {
					setStatus((prev) => (prev === "loading" ? "error" : prev));
				}
			} finally {
				if (!cancelled) {
					setIsPageLoading(false);
				}
			}
		}

		void loadFiltered();

		return () => {
			cancelled = true;
		};
	}, [fetchList, search]);

	const goToPage = useCallback(
		async (nextPage: number) => {
			if (
				isPageLoading ||
				nextPage < 1 ||
				nextPage > meta.totalPages ||
				nextPage === meta.page
			) {
				return;
			}

			setIsPageLoading(true);

			try {
				await fetchList(nextPage, search);
				ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			} catch {
				// Keep the current page visible if pagination fails.
			} finally {
				setIsPageLoading(false);
			}
		},
		[fetchList, isPageLoading, meta.page, meta.totalPages, search],
	);

	const hasPosts = status === "ready" && posts.length > 0;
	const showSearch = status === "ready" && (hasPosts || hasActiveFilters);
	const showPagination = hasPosts && meta.totalPages > 1;
	const showEmptyState =
		status === "error"
			? true
			: status === "ready" && posts.length === 0 && !hasActiveFilters;
	const showNoMatches =
		status === "ready" && posts.length === 0 && hasActiveFilters;

	const showLatest = hasPosts && meta.page === 1 && !hasActiveFilters;
	const latest = showLatest ? posts[0] : null;
	const rest = showLatest ? posts.slice(1) : hasPosts ? posts : [];

	const resultsLabel =
		meta.total === 1
			? t("results_status_one")
			: t("results_status", { count: meta.total });

	const headReveal = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 14 },
		animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
		transition: shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.45, ease: revealEase, delay },
	});

	const itemReveal = (index: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 16 },
		animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
		transition: shouldReduceMotion
			? { duration: 0 }
			: {
					duration: 0.5,
					ease: revealEase,
					delay: 0.12 + index * 0.07,
				},
	});

	const clearSearch = () => {
		setTitleQuery("");
		setDebouncedQuery("");
		searchRef.current?.focus();
	};

	return (
		<section ref={ref} className="home-section blog-index" id="posts">
			<div className="home-wrap blog-index__stack">
				<div className="blog-index__head">
					<motion.h2 className="blog-index__title" {...headReveal(0)}>
						{status === "error" ||
						(status === "ready" && posts.length === 0 && !hasActiveFilters)
							? t("headline_empty")
							: t("headline")}
					</motion.h2>
					<motion.p className="blog-index__lead" {...headReveal(0.08)}>
						{status === "loading"
							? t("loading")
							: status === "error"
								? t("error")
								: posts.length === 0 && !hasActiveFilters
									? t("description_empty")
									: t("description")}
					</motion.p>
				</div>

				{showSearch ? (
					<motion.div className="blog-filters" {...headReveal(0.12)}>
						<div className="blog-filters__search">
							<label className="sr-only" htmlFor="blog-search">
								{t("search_label")}
							</label>
							<span className="blog-filters__search-icon" aria-hidden>
								<Search className="size-4" strokeWidth={2} />
							</span>
							<input
								ref={searchRef}
								id="blog-search"
								type="search"
								className="blog-filters__input"
								placeholder={t("search_placeholder")}
								value={titleQuery}
								onChange={(event) => setTitleQuery(event.target.value)}
								autoComplete="off"
								enterKeyHint="search"
							/>
							{titleQuery ? (
								<button
									type="button"
									className="blog-filters__clear"
									onClick={clearSearch}
									aria-label={t("search_clear")}
								>
									<X className="size-4" aria-hidden />
								</button>
							) : null}
						</div>

						{status === "ready" && (hasActiveFilters || hasPosts) ? (
							<p
								className="blog-filters__status tabular-nums"
								role="status"
								aria-live="polite"
							>
								{resultsLabel}
							</p>
						) : null}
					</motion.div>
				) : null}

				{status === "loading" ? (
					<div className="blog-index__loading" aria-live="polite" aria-busy>
						<span className="sr-only">{t("loading")}</span>
						<article className="blog-featured blog-featured--skel">
							<SkeletonBlock className="blog-featured__media-skel" />
							<div className="blog-featured__body">
								<SkeletonBlock className="blog-skel--meta" />
								<SkeletonBlock className="blog-skel--title" />
								<SkeletonBlock className="blog-skel--title-sm" />
								<SkeletonBlock className="blog-skel--excerpt" />
								<SkeletonBlock className="blog-skel--excerpt-sm" />
								<SkeletonBlock className="blog-skel--excerpt-sm" />
							</div>
						</article>
						<ul className="blog-grid">
							{Array.from({ length: 4 }).map((_, i) => (
								<li key={i}>
									<div className="blog-card blog-card--skel">
										<SkeletonBlock className="blog-card__media-skel" />
										<div className="blog-card__body">
											<SkeletonBlock className="blog-skel--meta" />
											<SkeletonBlock className="blog-skel--title-sm" />
											<SkeletonBlock className="blog-skel--excerpt-sm" />
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{showEmptyState ? (
					<div
						className="blog-empty"
						role={status === "error" ? "alert" : undefined}
					>
						<p className="blog-empty__text">
							{status === "error" ? t("error") : t("description_empty")}
						</p>
					</div>
				) : null}

				{showNoMatches ? (
					<div className="blog-empty" role="status">
						<p className="blog-empty__text">{t("no_matches")}</p>
					</div>
				) : null}

				{hasPosts ? (
					<div
						className="blog-index__panel"
						aria-busy={isPageLoading}
						aria-live="polite"
					>
						{latest ? (
							<motion.article className="blog-featured" {...itemReveal(0)}>
								{getArticleCoverUrl(latest.cover_image) ? (
									<Link
										href={articleHref(latest)}
										className="blog-featured__media"
										tabIndex={-1}
										aria-hidden
									>
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={getArticleCoverUrl(latest.cover_image) as string}
											alt=""
											loading="eager"
										/>
									</Link>
								) : (
									<Link
										href={articleHref(latest)}
										className="blog-featured__media blog-featured__media--fallback"
										tabIndex={-1}
										aria-hidden
									>
										<span className="blog-media-title">{latest.title}</span>
									</Link>
								)}

								<div className="blog-featured__body">
									<p className="blog-featured__label">{t("latest")}</p>
									<PostMeta post={latest} metaLabel={t("meta_label")} />
									<h3 className="blog-featured__title">
										<Link href={articleHref(latest)}>{latest.title}</Link>
									</h3>
									{getArticleExcerpt(latest) ? (
										<p className="blog-featured__excerpt">
											{getArticleExcerpt(latest)}
										</p>
									) : null}
									<Link
										href={articleHref(latest)}
										className="blog-read-link"
										aria-label={t("read_post", { title: latest.title })}
									>
										{t("read_more")}
										<ArrowUpRight className="size-4" aria-hidden />
									</Link>
								</div>
							</motion.article>
						) : null}

						{rest.length > 0 ? (
							<ul className="blog-grid">
								{rest.map((post, index) => {
									const excerpt = getArticleExcerpt(post);
									const cover = getArticleCoverUrl(post.cover_image);

									return (
										<motion.li
											key={post.id}
											{...itemReveal(latest ? index + 1 : index)}
										>
											<article className="blog-card">
												{cover ? (
													<Link
														href={articleHref(post)}
														className="blog-card__media"
														tabIndex={-1}
														aria-hidden
													>
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img src={cover} alt="" loading="lazy" />
													</Link>
												) : (
													<Link
														href={articleHref(post)}
														className="blog-card__media blog-card__media--fallback"
														tabIndex={-1}
														aria-hidden
													>
														<span className="blog-media-title">
															{post.title}
														</span>
													</Link>
												)}

												<div className="blog-card__body">
													<PostMeta post={post} metaLabel={t("meta_label")} />
													<h3 className="blog-card__title">
														<Link href={articleHref(post)}>{post.title}</Link>
													</h3>
													{excerpt ? (
														<p className="blog-card__excerpt">{excerpt}</p>
													) : null}
													<Link
														href={articleHref(post)}
														className="blog-read-link blog-read-link--compact"
														aria-label={t("read_post", { title: post.title })}
													>
														{t("read_more")}
														<ArrowUpRight className="size-4" aria-hidden />
													</Link>
												</div>
											</article>
										</motion.li>
									);
								})}
							</ul>
						) : null}

						{isPageLoading ? (
							<div className="blog-index__overlay" aria-hidden>
								<Loader2 className="size-5 animate-spin" />
							</div>
						) : null}
					</div>
				) : null}

				{showPagination ? (
					<nav className="blog-pagination" aria-label={t("pagination_label")}>
						<button
							type="button"
							className="blog-pagination__btn"
							onClick={() => void goToPage(meta.page - 1)}
							disabled={!meta.hasPreviousPage || isPageLoading}
							aria-label={t("previous_page")}
						>
							<ChevronLeft className="size-4" aria-hidden />
							<span>{t("previous")}</span>
						</button>

						<p className="blog-pagination__status tabular-nums">
							{t("page_status", {
								current: meta.page,
								total: meta.totalPages,
							})}
						</p>

						<button
							type="button"
							className="blog-pagination__btn"
							onClick={() => void goToPage(meta.page + 1)}
							disabled={!meta.hasNextPage || isPageLoading}
							aria-label={t("next_page")}
						>
							<span>{t("next")}</span>
							<ChevronRight className="size-4" aria-hidden />
						</button>
					</nav>
				) : null}
			</div>
		</section>
	);
}
