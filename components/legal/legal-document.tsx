"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ArticleTocNav, {
	scrollToHeading,
	type TocEntry,
} from "@/components/blog/article-toc-nav";
import LegalContentBlocks from "@/components/legal/legal-content-blocks";
import { useRevealInView } from "@/hooks/use-page-end";
import { useCopy } from "@/lib/copy";
import { isLegalBlockArray } from "@/lib/legal-content";

const revealEase = [0.22, 1, 0.36, 1] as const;
const STAGGER_MS = 0.1;

type LegalDocumentProps = {
	namespace: "legal.terms" | "legal.privacy";
	sections: readonly string[];
};

export default function LegalDocument({
	namespace,
	sections,
}: LegalDocumentProps) {
	const t = useCopy(namespace);
	const tShared = useCopy("legal.shared");
	const ref = useRef<HTMLElement>(null);
	const inView = useRevealInView(ref, { once: true, margin: "-8% 0px" });
	const shouldReduceMotion = useReducedMotion();
	const contentRef = useRef<HTMLDivElement>(null);
	const [activeSection, setActiveSection] = useState<string | null>(
		sections[0] ?? null,
	);
	const [readProgress, setReadProgress] = useState(0);
	const lockRef = useRef<string | null>(null);
	const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const toc = useMemo<TocEntry[]>(
		() =>
			sections.map((section) => ({
				id: section,
				label: t(`sections.${section}.title`),
				level: 1,
			})),
		[sections, t],
	);

	// Scroll-spy + reading progress, same behaviour as blog articles.
	useEffect(() => {
		let frame = 0;

		const sync = () => {
			frame = 0;

			if (lockRef.current) {
				setActiveSection(lockRef.current);
			} else {
				const threshold = window.innerHeight * 0.4;
				let current: string | null = sections[0] ?? null;
				for (const section of sections) {
					const el = document.getElementById(section);
					if (el && el.getBoundingClientRect().top <= threshold) {
						current = section;
					}
				}
				setActiveSection((prev) => (prev === current ? prev : current));
			}

			const el = contentRef.current;
			if (el && el.offsetHeight > 0) {
				const top = el.getBoundingClientRect().top + window.scrollY;
				const total = Math.max(el.offsetHeight, 1);
				const viewportBottom = window.scrollY + window.innerHeight;
				setReadProgress(
					Math.min(Math.max(viewportBottom - top, 0), total) / total,
				);
			}
		};

		const onScrollOrResize = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(sync);
		};

		sync();
		window.addEventListener("scroll", onScrollOrResize, { passive: true });
		window.addEventListener("resize", onScrollOrResize);

		return () => {
			if (frame) window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScrollOrResize);
			window.removeEventListener("resize", onScrollOrResize);
		};
	}, [sections]);

	// Lift the floating CTA above the mobile bottom TOC bar while on screen.
	useEffect(() => {
		const el = contentRef.current;
		if (!el) return;
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
	}, []);

	useEffect(() => {
		return () => {
			if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
		};
	}, []);

	const selectSection = useCallback(
		(id: string) => {
			scrollToHeading(id, !shouldReduceMotion);
			setActiveSection(id);
			lockRef.current = id;
			if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
			// Hold the highlight through the smooth scroll.
			lockTimerRef.current = setTimeout(() => {
				lockRef.current = null;
				lockTimerRef.current = null;
			}, 1200);
		},
		[shouldReduceMotion],
	);

	const readPercent = Math.round(Math.min(Math.max(readProgress, 0), 1) * 100);

	return (
		<section ref={ref} className="legal-doc">
			<div className="home-wrap">
				<div className="legal-doc__layout">
					<aside className="blog-article__toc legal-doc__toc">
						<div
							className="blog-toc-progress"
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={readPercent}
							aria-label={tShared("progress_label")}
						>
							<div
								className="blog-toc-progress__fill"
								style={{ "--read": readPercent / 100 } as React.CSSProperties}
								aria-hidden="true"
							/>
							<span className="sr-only">
								{tShared("progress_status", { percent: readPercent })}
							</span>
						</div>
						<ArticleTocNav
							toc={toc}
							activeTocId={activeSection}
							onSelect={selectSection}
							label={tShared("toc_heading")}
							navLabel={tShared("toc_label")}
						/>
					</aside>

					<div ref={contentRef} className="legal-doc__content">
						{sections.map((section, index) => {
							const blocks = t.raw(`sections.${section}.blocks`);
							const transition = shouldReduceMotion
								? { duration: 0 }
								: {
										duration: 0.5,
										ease: revealEase,
										delay: index * STAGGER_MS,
									};

							return (
								<motion.article
									key={section}
									id={section}
									className="legal-doc__section"
									initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
									animate={
										inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
									}
									transition={transition}
								>
									<header className="legal-doc__section-head">
										<span className="legal-doc__section-num" aria-hidden>
											{String(index + 1).padStart(2, "0")}
										</span>
										<h2 className="legal-doc__title">
											{t(`sections.${section}.title`)}
										</h2>
									</header>
									{isLegalBlockArray(blocks) ? (
										<LegalContentBlocks blocks={blocks} />
									) : null}
								</motion.article>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
