"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
	clearReloadScrollAnchor,
	DEFERRED_SECTION_ATTR,
	getReloadScrollAnchor,
	saveReloadScrollAnchor,
} from "@/lib/reload-scroll-restore";
import {
	scrollToHashTarget,
	scrollToHashTargetWhenReady,
	waitForStableLayout,
} from "@/lib/wait-for-stable-layout";

/** Polls until every deferred section has rendered its lazily loaded content. */
function waitForDeferredSections(
	signal: AbortSignal,
	checkEvery = 50,
	timeout = 5000,
): Promise<void> {
	return new Promise((resolve) => {
		const allMounted = () =>
			[
				...document.querySelectorAll<HTMLElement>(`[${DEFERRED_SECTION_ATTR}]`),
			].every((el) => el.childElementCount > 0);

		if (signal.aborted || allMounted()) {
			resolve();
			return;
		}

		const finish = () => {
			clearInterval(interval);
			clearTimeout(timer);
			resolve();
		};
		const interval = setInterval(() => {
			if (signal.aborted || allMounted()) finish();
		}, checkEvery);
		const timer = setTimeout(finish, timeout);
		signal.addEventListener("abort", finish, { once: true });
	});
}

/** Sections the URL hash follows while scrolling, per page, in page order. */
const SPY_SECTION_IDS: Record<string, string[]> = {
	"/": [
		"who-we-are",
		"core-services-1",
		"core-services-2",
		"core-services-3",
		"core-services-4",
		"what-we-build",
		"why-clients-choose-us",
		"global-partnerships",
		"faq",
		"contact",
	],
	"/services": [
		...Array.from({ length: 7 }, (_, i) => `services-${i + 1}`),
		"how-we-work",
		"tech-stack",
	],
	"/about": ["who-we-are", "our-culture", "life-at-codevider", "team"],
	"/vibe-code-rescue": [
		"reality",
		"situations",
		"arrival",
		"process",
		"stack",
		"keep",
		"after",
		"ready",
		"next",
		"contact",
	],
};

async function restoreReloadScroll(signal: AbortSignal) {
	const root = document.documentElement;
	const reveal = () => root.classList.remove("reload-restoring");

	const anchor = getReloadScrollAnchor();
	if (!anchor) {
		// A URL hash is revealed by landOnHashTarget once it has jumped there.
		if (window.location.hash.length <= 1) reveal();
		return;
	}

	const scrollToAnchor = () => {
		const el = anchor.sectionId
			? document.getElementById(anchor.sectionId)
			: null;
		const base = el ? el.getBoundingClientRect().top + window.scrollY : 0;
		const top = base + anchor.offset;
		if (Math.abs(window.scrollY - top) > 1) {
			window.scrollTo({ top, behavior: "instant" });
		}
	};

	// Page is hidden (see site-document) — let every section load and the
	// layout settle, then jump once and fade in.
	await waitForDeferredSections(signal);
	await waitForStableLayout(200, 50, 3000, signal);
	scrollToAnchor();
	reveal();
	if (signal.aborted) return;

	// Late images/fonts can still shift things; keep the anchor pinned until
	// the layout settles or the user scrolls.
	await waitForStableLayout(400, 50, 3000, signal);
	if (!signal.aborted) scrollToAnchor();
}

/**
 * Page loaded with a hash: the page is hidden (see site-document), so jump
 * straight to the target once it has rendered and fade in. A smooth scroll
 * here would start against the short pre-mount page and get restarted
 * mid-flight once the sections above the target grow (move, stop, move).
 */
async function landOnHashTarget(id: string, signal: AbortSignal) {
	// Aborts here only come from effect cleanup (e.g. StrictMode's re-run),
	// which starts a fresh landing — so leave the page hidden for that one.
	if (!document.getElementById(id)?.childElementCount) {
		await waitForDeferredSections(signal);
	}
	await waitForStableLayout(200, 50, 3000, signal);
	if (signal.aborted) return;

	const el = document.getElementById(id);
	if (el) scrollToHashTarget(el, "instant");
	document.documentElement.classList.remove("reload-restoring");
	if (!el) return;

	// Late images/fonts can still shift things; re-pin the target once the
	// layout settles, unless the user has started scrolling.
	let userScrolled = false;
	const onUser = () => {
		userScrolled = true;
	};
	const events = ["wheel", "touchstart", "keydown"] as const;
	for (const type of events) {
		window.addEventListener(type, onUser, { once: true, passive: true });
	}
	await waitForStableLayout(400, 50, 3000, signal);
	for (const type of events) window.removeEventListener(type, onUser);
	if (!signal.aborted && !userScrolled) scrollToHashTarget(el, "instant");
}

/**
 * Scrolls to a hash target after deferred sections mount and layout settles.
 */
export function HashScrollHandler() {
	const pathname = usePathname();
	const [locationHash, setLocationHash] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname re-reads the hash after client-side navigation
	useEffect(() => {
		const syncHash = () => setLocationHash(window.location.hash);

		syncHash();
		window.addEventListener("hashchange", syncHash);

		return () => window.removeEventListener("hashchange", syncHash);
	}, [pathname]);

	useEffect(() => {
		window.addEventListener("pagehide", saveReloadScrollAnchor);
		return () => window.removeEventListener("pagehide", saveReloadScrollAnchor);
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		const stop = () => controller.abort();
		// Stop fighting the user if they start scrolling themselves.
		window.addEventListener("wheel", stop, { once: true, passive: true });
		window.addEventListener("touchstart", stop, { once: true, passive: true });
		window.addEventListener("keydown", stop, { once: true });
		void restoreReloadScroll(controller.signal).finally(
			clearReloadScrollAnchor,
		);
		return () => {
			stop();
			window.removeEventListener("wheel", stop);
			window.removeEventListener("touchstart", stop);
			window.removeEventListener("keydown", stop);
		};
	}, []);

	// Same-page hash links: skip the browser's native smooth scroll. It starts
	// before deferred sections mount, so the page grows mid-flight and the
	// drift correction restarts the scroll (move, stop, move). Instead update
	// the hash ourselves; hashchange mounts the sections and the handler below
	// scrolls once the layout has settled.
	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			)
				return;
			const link = (event.target as Element | null)?.closest?.("a[href]");
			if (!(link instanceof HTMLAnchorElement) || link.target) return;
			const url = new URL(link.href, window.location.href);
			if (
				!url.hash ||
				url.origin !== window.location.origin ||
				url.pathname !== window.location.pathname ||
				url.search !== window.location.search
			)
				return;

			event.preventDefault();
			const oldURL = window.location.href;
			if (url.hash === window.location.hash) {
				const el = document.getElementById(url.hash.slice(1));
				if (el) scrollToHashTarget(el);
				return;
			}
			window.history.pushState(window.history.state, "", url.href);
			window.dispatchEvent(
				new HashChangeEvent("hashchange", { oldURL, newURL: url.href }),
			);
		};

		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, []);

	// Scroll spy: keep the URL hash in sync with the section in view.
	useEffect(() => {
		const sectionIds = SPY_SECTION_IDS[pathname];
		if (!sectionIds) return;

		// Only react to user-driven scrolling, not programmatic hash/restore scrolls.
		let userScrolling = false;
		let frame = 0;
		const markUser = () => {
			userScrolling = true;
		};
		const pauseSpy = () => {
			userScrolling = false;
		};

		const update = () => {
			frame = 0;
			if (!userScrolling) return;
			if (document.documentElement.classList.contains("reload-restoring"))
				return;

			const line = window.innerHeight / 3;
			let current: HTMLElement | null = null;
			for (const id of sectionIds) {
				const el = document.getElementById(id);
				if (el && el.getBoundingClientRect().top <= line) current = el;
			}

			const nextHash = current ? `#${current.id}` : "";
			if (nextHash === window.location.hash) return;
			const url = `${window.location.pathname}${window.location.search}${nextHash}`;
			// replaceState doesn't fire hashchange, so no scroll-to-target is triggered.
			window.history.replaceState(window.history.state, "", url);
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		window.addEventListener("wheel", markUser, { passive: true });
		window.addEventListener("touchstart", markUser, { passive: true });
		window.addEventListener("keydown", markUser);
		window.addEventListener("hashchange", pauseSpy);
		// Link clicks may trigger smooth scrolls; don't rewrite the hash mid-flight.
		window.addEventListener("click", pauseSpy);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("wheel", markUser);
			window.removeEventListener("touchstart", markUser);
			window.removeEventListener("keydown", markUser);
			window.removeEventListener("hashchange", pauseSpy);
			window.removeEventListener("click", pauseSpy);
			window.removeEventListener("scroll", onScroll);
		};
	}, [pathname]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname re-triggers hash scrolling after client-side navigation
	useEffect(() => {
		if (!locationHash) return;

		const id = locationHash.slice(1);
		if (!id) return;

		const controller = new AbortController();
		const landing =
			document.documentElement.classList.contains("reload-restoring");

		void (landing ? landOnHashTarget : scrollToHashTargetWhenReady)(
			id,
			controller.signal,
		);

		return () => controller.abort();
	}, [pathname, locationHash]);

	return null;
}
