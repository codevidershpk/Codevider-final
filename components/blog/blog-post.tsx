"use client";

import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ArticleBody from "@/components/blog/article-body";
import ArticleTocNav, {
	getTocScrollOffsetPx,
	scrollToHeading,
} from "@/components/blog/article-toc-nav";
import BlogRelated from "@/components/blog/blog-related";
import BlogShare from "@/components/blog/blog-share";
import { fetchArticleBySlugOrId } from "@/lib/api/blog-posts";
import {
	type ArticleTocEntry,
	getArticleTocEntries,
	slugifyHeading,
} from "@/lib/blog/article-markdown";
import {
	formatArticleDate,
	getArticleCoverUrl,
	getArticleDateValue,
	getArticleExcerpt,
} from "@/lib/blog/article-utils";
import { useCopy } from "@/lib/copy";
import type { Article } from "@/lib/types/blog";

const revealEase = [0.22, 1, 0.36, 1] as const;
/**
 * Builds TOC entries from the actually rendered headings so ids can never
 * drift from the markdown-derived list (KaTeX, images, raw HTML all render
 * differently than their markdown source). Missing ids are assigned in place.
 */
function scanRenderedHeadings(root: HTMLElement): ArticleTocEntry[] {
	const nodes = root.querySelectorAll(".blog-h1, .blog-h2, .blog-h3");
	const used = new Set<string>();
	const entries: ArticleTocEntry[] = [];

	nodes.forEach((node) => {
		const el = node as HTMLElement;
		const label = (el.textContent ?? "").replace(/\s+/g, " ").trim();
		if (!label) return;

		let id = el.id.trim();
		if (
			!id ||
			used.has(id) ||
			document.querySelectorAll(`#${CSS.escape(id)}`).length > 1
		) {
			const base = slugifyHeading(label);
			let candidate = `article-${base}`;
			let n = 2;
			while (
				used.has(candidate) ||
				(document.getElementById(candidate) !== null &&
					document.getElementById(candidate) !== el)
			) {
				candidate = `article-${base}-${n}`;
				n += 1;
			}
			el.id = candidate;
			id = candidate;
		}
		used.add(id);

		const level: 1 | 2 | 3 = el.classList.contains("blog-h1")
			? 1
			: el.classList.contains("blog-h2")
				? 2
				: 3;
		entries.push({ id, label, level });
	});

	return entries;
}

type LoadState =
	| { status: "loading" }
	| { status: "error" }
	| { status: "ready"; post: Article };

export default function BlogPost() {
	const t = useCopy("blog.post");
	const metadataT = useCopy("metadata.blog_post");
	const searchParams = useSearchParams();
	// The `id` query value is a slug or numeric id (`/blogs/post?id=my-slug`).
	const slugOrId = searchParams.get("id")?.trim() || null;
	const shouldReduceMotion = useReducedMotion();
	const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
	const [activeTocId, setActiveTocId] = useState<string | null>(null);
	const [readProgress, setReadProgress] = useState(0);
	const contentRef = useRef<HTMLDivElement>(null);
	const tocLockRef = useRef<string | null>(null);
	const tocLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const loadPost = useCallback(async (key: string) => {
		setLoadState({ status: "loading" });

		try {
			const post = await fetchArticleBySlugOrId(key);
			setLoadState({ status: "ready", post });
		} catch {
			setLoadState({ status: "error" });
		}
	}, []);

	useEffect(() => {
		if (!slugOrId) {
			setLoadState({ status: "error" });
			return;
		}

		void loadPost(slugOrId);
	}, [loadPost, slugOrId]);

	useEffect(() => {
		if (loadState.status !== "ready") return;

		const nextTitle = metadataT("title_with_post", {
			title: loadState.post.title,
		});
		const previousTitle = document.title;
		document.title = nextTitle;

		return () => {
			document.title = previousTitle;
		};
	}, [loadState, metadataT]);

	const markdownToc = useMemo(
		() =>
			loadState.status === "ready"
				? getArticleTocEntries(loadState.post.content)
				: [],
		[loadState],
	);

	// DOM-derived TOC (primary): scanned from the rendered headings so ids
	// always resolve. Falls back to the markdown list until the scan runs.
	const [domToc, setDomToc] = useState<ArticleTocEntry[]>([]);
	const toc = domToc.length > 0 ? domToc : markdownToc;

	// Flag while the article is on screen so the floating CTA can clear the
	// mobile TOC bar, which only sticks until the article ends.
	const hasToc = toc.length > 0;
	useEffect(() => {
		const el = contentRef.current;
		if (!el || !hasToc) return;
		const root = document.documentElement;
		const io = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) root.dataset.articleTocBar = "";
			else delete root.dataset.articleTocBar;
		});
		io.observe(el);
		return () => {
			io.disconnect();
			delete root.dataset.articleTocBar;
		};
	}, [hasToc]);

	// Scan the rendered article for headings once content is mounted.
	useEffect(() => {
		if (loadState.status !== "ready") {
			setDomToc([]);
			return;
		}
		let cancelled = false;
		const frame = window.requestAnimationFrame(() => {
			if (cancelled) return;
			const root = contentRef.current;
			if (!root) return;
			const scanned = scanRenderedHeadings(root);
			if (!cancelled && scanned.length > 0) setDomToc(scanned);
		});
		return () => {
			cancelled = true;
			window.cancelAnimationFrame(frame);
		};
	}, [loadState]);

	useEffect(() => {
		if (toc.length === 0) {
			setActiveTocId(null);
			return;
		}

		let frame = 0;

		const syncActive = () => {
			frame = 0;

			if (tocLockRef.current) {
				setActiveTocId(tocLockRef.current);
				return;
			}

			// Highlight the last heading that has crossed 40% down the
			// viewport — the section currently in the reading band.
			const threshold = window.innerHeight * 0.4;
			let current: string | null = null;

			for (const entry of toc) {
				const el = document.getElementById(entry.id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= threshold) {
					current = entry.id;
				}
			}

			// Before the first heading, keep the first entry highlighted.
			if (!current) {
				const first = toc[0];
				current = first ? first.id : null;
			}

			setActiveTocId((prev) => (prev === current ? prev : current));
		};

		const onScrollOrResize = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(syncActive);
		};

		syncActive();
		window.addEventListener("scroll", onScrollOrResize, { passive: true });
		window.addEventListener("resize", onScrollOrResize);

		return () => {
			if (frame) window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScrollOrResize);
			window.removeEventListener("resize", onScrollOrResize);
		};
	}, [toc]);

	const selectTocEntry = useCallback(
		(id: string) => {
			scrollToHeading(id, !shouldReduceMotion);

			setActiveTocId(id);
			tocLockRef.current = id;

			if (tocLockTimerRef.current) {
				clearTimeout(tocLockTimerRef.current);
			}

			// Hold the highlight through the smooth scroll, then release so
			// scroll-spy takes over again.
			tocLockTimerRef.current = setTimeout(() => {
				tocLockRef.current = null;
				tocLockTimerRef.current = null;
			}, 1200);
		},
		[shouldReduceMotion],
	);

	// Deep-links (`#article-…`) land on the heading once content is ready.
	useEffect(() => {
		if (loadState.status !== "ready" || toc.length === 0) return;

		const hash = window.location.hash.slice(1);
		if (!hash || !toc.some((entry) => entry.id === hash)) return;

		const frame = window.requestAnimationFrame(() => {
			if (scrollToHeading(hash, !shouldReduceMotion)) {
				setActiveTocId(hash);
			}
		});
		// Late layout shifts (images, diagrams) can move the target after the
		// first scroll — correct once without animating.
		const settleTimer = window.setTimeout(() => {
			const target = document.getElementById(hash);
			if (target) {
				const off = getTocScrollOffsetPx();
				const drift = target.getBoundingClientRect().top - off;
				if (Math.abs(drift) > 48) scrollToHeading(hash, false);
			}
		}, 900);

		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(settleTimer);
		};
	}, [loadState.status, toc, shouldReduceMotion]);

	useEffect(() => {
		return () => {
			if (tocLockTimerRef.current) {
				clearTimeout(tocLockTimerRef.current);
			}
		};
	}, []);

	// Tracks how much of the article body has been read (0 → 1). The slim
	// TOC rail line fills top to bottom as the reader scrolls.
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the TOC changes so the read-progress targets refresh
	useEffect(() => {
		if (loadState.status !== "ready") {
			setReadProgress(0);
			return;
		}

		let frame = 0;
		let resizeObserver: ResizeObserver | null = null;

		const syncProgress = () => {
			frame = 0;

			const el = contentRef.current;
			if (!el || el.offsetHeight === 0) return;

			const top = el.getBoundingClientRect().top + window.scrollY;
			const total = Math.max(el.offsetHeight, 1);
			const viewportBottom = window.scrollY + window.innerHeight;
			const read = Math.min(Math.max(viewportBottom - top, 0), total);

			setReadProgress(read / total);
		};

		const onScrollOrResize = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(syncProgress);
		};

		syncProgress();
		window.addEventListener("scroll", onScrollOrResize, { passive: true });
		window.addEventListener("resize", onScrollOrResize);

		// Lazy images / math / diagrams change the height after load.
		const contentEl = contentRef.current;
		if (contentEl && typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(onScrollOrResize);
			resizeObserver.observe(contentEl);
		}

		return () => {
			if (frame) window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScrollOrResize);
			window.removeEventListener("resize", onScrollOrResize);
			resizeObserver?.disconnect();
		};
	}, [loadState.status, toc]);

	const reveal = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 14 },
		animate: { opacity: 1, y: 0 },
		transition: shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.45, ease: revealEase, delay },
	});

	const post = loadState.status === "ready" ? loadState.post : null;
	const dateLabel = post ? formatArticleDate(getArticleDateValue(post)) : null;
	const excerpt = post ? getArticleExcerpt(post) : null;
	const cover = post ? getArticleCoverUrl(post.cover_image) : null;
	const readPercent = Math.round(Math.min(Math.max(readProgress, 0), 1) * 100);

	return (
		<section className="blog-article">
			<div className="home-wrap blog-article__shell">
				<motion.div {...reveal(0)}>
					<Link href="/blogs#posts" className="blog-article__back">
						<ArrowLeft className="size-4" aria-hidden />
						{t("back")}
					</Link>
				</motion.div>

				{loadState.status === "loading" ? (
					<div className="blog-article__loading" aria-live="polite" aria-busy>
						<span className="sr-only">{t("loading")}</span>
						<div className="blog-skel blog-skel--meta" aria-hidden />
						<div className="blog-skel blog-skel--article-title" aria-hidden />
						<div
							className="blog-skel blog-skel--article-title-sm"
							aria-hidden
						/>
						<div className="blog-skel blog-skel--excerpt" aria-hidden />
						<div className="blog-skel blog-skel--cover" aria-hidden />
						<div className="blog-skel blog-skel--line" aria-hidden />
						<div className="blog-skel blog-skel--line" aria-hidden />
						<div className="blog-skel blog-skel--line-sm" aria-hidden />
					</div>
				) : null}

				{loadState.status === "error" ? (
					<div className="blog-article__error" role="alert">
						<p>{t("error")}</p>
						<button
							type="button"
							className="svc-cta__btn"
							onClick={() => {
								if (slugOrId) void loadPost(slugOrId);
							}}
						>
							{t("retry")}
						</button>
					</div>
				) : null}

				{post ? (
					<>
						<motion.header className="blog-article__header" {...reveal(0.06)}>
							<h1 className="blog-article__title">{post.title}</h1>
							{excerpt ? <p className="blog-article__lead">{excerpt}</p> : null}
							{dateLabel && (
								<ul
									className="blog-meta blog-meta--article"
									aria-label={t("meta_label")}
								>
									<li>
										<span className="tabular-nums">{dateLabel}</span>
									</li>
								</ul>
							)}
						</motion.header>

						<motion.figure
							className={
								cover
									? "blog-article__cover"
									: "blog-article__cover blog-article__cover--title"
							}
							{...reveal(0.1)}
						>
							{cover ? (
								<>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={cover} alt="" />
								</>
							) : (
								<p className="blog-article__cover-title">{post.title}</p>
							)}
						</motion.figure>

						<div
							className={
								toc.length > 0
									? "blog-article__layout"
									: "blog-article__layout blog-article__layout--solo"
							}
						>
							{toc.length > 0 ? (
								/* Opacity-only reveal — transform wrappers break position:sticky */
								<motion.aside
									className="blog-article__toc"
									initial={shouldReduceMotion ? false : { opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={
										shouldReduceMotion
											? { duration: 0 }
											: { duration: 0.45, ease: revealEase, delay: 0.12 }
									}
								>
									<div
										className="blog-toc-progress"
										role="progressbar"
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={readPercent}
										aria-label={t("progress_label")}
									>
										<div
											className="blog-toc-progress__fill"
											style={
												{ "--read": readPercent / 100 } as React.CSSProperties
											}
											aria-hidden="true"
										/>
										<span className="sr-only">
											{t("progress_status", { percent: readPercent })}
										</span>
									</div>
									<ArticleTocNav
										toc={toc}
										activeTocId={activeTocId}
										onSelect={selectTocEntry}
										label={t("toc_label")}
										navLabel={t("toc_nav")}
									/>
								</motion.aside>
							) : null}

							<motion.div
								ref={contentRef}
								className="blog-article__content"
								{...reveal(0.14)}
							>
								{post.content.trim() ? (
									<ArticleBody markdown={post.content} />
								) : (
									<p className="blog-p">{t("empty_body")}</p>
								)}
							</motion.div>
						</div>

						<motion.div {...reveal(0.16)}>
							<BlogShare title={post.title} />
						</motion.div>

						<motion.div {...reveal(0.2)}>
							<BlogRelated currentId={post.id} />
						</motion.div>

						<motion.footer className="blog-article__footer" {...reveal(0.22)}>
							<Link href="/blogs#posts" className="blog-article__back">
								<ArrowLeft className="size-4" aria-hidden />
								{t("back")}
							</Link>
						</motion.footer>
					</>
				) : null}
			</div>
		</section>
	);
}
