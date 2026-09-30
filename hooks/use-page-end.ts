"use client";

import { type UseInViewOptions, useInView } from "motion/react";
import { type RefObject, useSyncExternalStore } from "react";

/** Distance from the bottom (px) that counts as "reached the end". */
const PAGE_END_THRESHOLD = 4;

let reachedEnd = false;
const listeners = new Set<() => void>();

function check() {
	if (reachedEnd) return;
	const { scrollY, innerHeight } = window;
	if (
		scrollY + innerHeight >=
		document.documentElement.scrollHeight - PAGE_END_THRESHOLD
	) {
		reachedEnd = true;
		// Opts every `content-visibility: auto` section out of render skipping
		// (see globals.css) so off-screen sections stay painted, e.g. for
		// full-page screenshots.
		document.documentElement.dataset.pageEnd = "";
		// Lazy images below the fold may never have started loading.
		for (const img of document.querySelectorAll<HTMLImageElement>(
			'img[loading="lazy"]',
		)) {
			img.loading = "eager";
		}
		window.removeEventListener("scroll", check);
		window.removeEventListener("resize", check);
		for (const listener of listeners) listener();
	}
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	if (listeners.size === 1 && !reachedEnd) {
		window.addEventListener("scroll", check, { passive: true });
		window.addEventListener("resize", check);
		// Short pages, restored scroll, or a full-height viewport (e.g. a
		// full-page screenshot) can already be at the end with no scroll event.
		requestAnimationFrame(check);
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) {
			window.removeEventListener("scroll", check);
			window.removeEventListener("resize", check);
		}
	};
}

/**
 * True once the user has scrolled to the bottom of the page. Latches so
 * scroll-triggered content never stays hidden after the page end is reached
 * (elements near the footer can otherwise miss their in-view margin).
 * Resets on client-side navigation via `resetPageEnd`.
 */
export function usePageEnd() {
	return useSyncExternalStore(
		subscribe,
		() => reachedEnd,
		() => false,
	);
}

/** Clears the latch — call when the route changes. */
export function resetPageEnd() {
	reachedEnd = false;
	delete document.documentElement.dataset.pageEnd;
	if (listeners.size > 0) {
		window.addEventListener("scroll", check, { passive: true });
		window.addEventListener("resize", check);
		requestAnimationFrame(check);
	}
	for (const listener of listeners) listener();
}

/**
 * Drop-in for motion's `useInView` that also reports true once the page end
 * is reached, so every reveal completes when scrolling to the bottom.
 */
export function useRevealInView(
	ref: RefObject<Element | null>,
	options?: UseInViewOptions,
) {
	const inView = useInView(ref, options);
	const atPageEnd = usePageEnd();
	return inView || atPageEnd;
}
