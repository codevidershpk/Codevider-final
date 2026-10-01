"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

export type TocEntry = { id: string; label: string; level: 1 | 2 | 3 };

const tocSpring = {
	type: "spring" as const,
	stiffness: 420,
	damping: 38,
	mass: 0.7,
};

/**
 * Sticky offset for TOC scrolling: fixed navbar height + breathing room
 * (the mobile TOC bar sits at the bottom, so it doesn't cover headings). Measured live so it stays correct
 * whether the auto-hiding navbar is currently visible or not.
 */
export function getTocScrollOffsetPx(): number {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return 104;
	}
	const isDesktop = window.innerWidth >= 1024;
	const navEl = document.querySelector("[data-navbar]");
	let navH = isDesktop ? 72 : 60;
	if (navEl) {
		const rect = navEl.getBoundingClientRect();
		// Auto-hiding navbar translates off-screen when scrolled past.
		navH = rect.bottom > 0 ? Math.max(0, Math.min(rect.bottom, 96)) : 0;
	}
	return Math.ceil(navH + 12);
}

/** Smooth-scrolls to a heading, landing it below the navbar/sticky TOC. */
export function scrollToHeading(id: string, smooth: boolean): boolean {
	const target = document.getElementById(id);
	if (!target) return false;
	try {
		window.history.replaceState(null, "", `#${id}`);
	} catch {
		// Hash update is best-effort; scrolling still works.
	}
	const top =
		target.getBoundingClientRect().top +
		window.scrollY -
		getTocScrollOffsetPx();
	window.scrollTo({
		top: Math.max(0, top),
		behavior: smooth ? "smooth" : "auto",
	});
	return true;
}

export default function ArticleTocNav({
	toc,
	activeTocId,
	onSelect,
	label,
	navLabel,
}: {
	toc: TocEntry[];
	activeTocId: string | null;
	onSelect: (id: string) => void;
	label: string;
	navLabel: string;
}) {
	const shouldReduceMotion = useReducedMotion();
	const listRef = useRef<HTMLOListElement>(null);
	const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [highlight, setHighlight] = useState({
		y: 0,
		height: 0,
		ready: false,
	});

	const highlightId = hoveredId ?? activeTocId;

	const syncHighlight = useCallback((id: string | null) => {
		const list = listRef.current;
		if (!list || !id) {
			setHighlight((prev) => ({ ...prev, ready: false }));
			return;
		}

		const link = linkRefs.current.get(id);
		if (!link) {
			setHighlight((prev) => ({ ...prev, ready: false }));
			return;
		}

		const listRect = list.getBoundingClientRect();
		const linkRect = link.getBoundingClientRect();

		setHighlight({
			y: linkRect.top - listRect.top + list.scrollTop,
			height: linkRect.height,
			ready: true,
		});
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the TOC changes so the highlight re-syncs to new entries
	useEffect(() => {
		syncHighlight(highlightId);

		const list = listRef.current;
		if (!list) return;

		const observer = new ResizeObserver(() => {
			syncHighlight(highlightId);
		});
		observer.observe(list);

		return () => observer.disconnect();
	}, [highlightId, syncHighlight, toc]);

	const setLinkRef = useCallback(
		(id: string, node: HTMLAnchorElement | null) => {
			if (node) linkRefs.current.set(id, node);
			else linkRefs.current.delete(id);
		},
		[],
	);

	// Keep the active entry visible inside the TOC rail without scrolling
	// the page: nudge the list's own scroll position (vertical on desktop,
	// horizontal pills on mobile).
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the TOC changes so the active entry is re-measured
	useEffect(() => {
		if (hoveredId || !activeTocId) return;
		const list = listRef.current;
		const link = linkRefs.current.get(activeTocId);
		if (!list || !link) return;

		const frame = window.requestAnimationFrame(() => {
			const listRect = list.getBoundingClientRect();
			const linkRect = link.getBoundingClientRect();
			const smooth = !shouldReduceMotion;

			if (window.innerWidth < 1024) {
				const overLeft = linkRect.left - listRect.left;
				const overRight = linkRect.right - listRect.right;
				if (overLeft < -4 || overRight > 4) {
					list.scrollTo({
						left:
							list.scrollLeft + (overLeft < -4 ? overLeft - 8 : overRight + 8),
						behavior: smooth ? "smooth" : "auto",
					});
				}
				return;
			}

			const overTop = linkRect.top - listRect.top;
			const overBottom = linkRect.bottom - listRect.bottom;
			if (overTop < -4 || overBottom > 4) {
				list.scrollTo({
					top: list.scrollTop + (overTop < -4 ? overTop - 8 : overBottom + 8),
					behavior: smooth ? "smooth" : "auto",
				});
			}
		});

		return () => window.cancelAnimationFrame(frame);
	}, [activeTocId, hoveredId, shouldReduceMotion, toc]);

	const pickNearestId = useCallback(
		(clientY: number) => {
			let nearestId: string | null = null;
			let nearestDistance = Number.POSITIVE_INFINITY;

			for (const entry of toc) {
				const link = linkRefs.current.get(entry.id);
				if (!link) continue;

				const rect = link.getBoundingClientRect();
				const center = rect.top + rect.height / 2;
				const distance = Math.abs(center - clientY);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestId = entry.id;
				}
			}

			return nearestId;
		},
		[toc],
	);

	return (
		<nav className="blog-toc" aria-label={navLabel}>
			<p className="blog-toc__label">{label}</p>
			<ol
				ref={listRef}
				className="blog-toc__list"
				onPointerLeave={() => setHoveredId(null)}
				onPointerMove={(event) => {
					if (event.pointerType === "touch") return;
					const nextId = pickNearestId(event.clientY);
					if (nextId && nextId !== hoveredId) {
						setHoveredId(nextId);
					}
				}}
			>
				{highlight.ready ? (
					<motion.span
						className={
							highlightId && highlightId === activeTocId && !hoveredId
								? "blog-toc__highlight blog-toc__highlight--active"
								: "blog-toc__highlight"
						}
						aria-hidden
						initial={false}
						animate={{
							y: highlight.y,
							height: highlight.height,
							opacity: 1,
						}}
						transition={shouldReduceMotion ? { duration: 0 } : tocSpring}
					/>
				) : null}

				{toc.map((entry) => {
					const isScrollActive = !hoveredId && activeTocId === entry.id;
					const isHot = hoveredId === entry.id;

					return (
						<li
							key={entry.id}
							className={`blog-toc__item blog-toc__item--l${entry.level}`}
						>
							<a
								ref={(node) => {
									setLinkRef(entry.id, node);
								}}
								href={`#${entry.id}`}
								className={
									isScrollActive
										? "blog-toc__link blog-toc__link--active"
										: isHot
											? "blog-toc__link blog-toc__link--hot"
											: "blog-toc__link"
								}
								aria-current={isScrollActive ? "location" : undefined}
								onClick={(event) => {
									event.preventDefault();
									onSelect(entry.id);
								}}
								onFocus={() => setHoveredId(entry.id)}
								onBlur={() => setHoveredId(null)}
							>
								<span className="blog-toc__text">{entry.label}</span>
							</a>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
