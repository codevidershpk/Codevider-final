const STORAGE_KEY = "reload-scroll-anchor";
const SECTION_ATTR = "data-deferred-section";

interface ScrollAnchor {
	path: string;
	sectionId: string | null;
	offset: number;
}

let pendingAnchor: ScrollAnchor | null | undefined;

function isReload(): boolean {
	const [nav] = performance.getEntriesByType(
		"navigation",
	) as PerformanceNavigationTiming[];
	return nav?.type === "reload";
}

/**
 * Returns the saved anchor when this page load is a reload of the same path
 * (and no hash target overrides it). Read once per page load.
 */
export function getReloadScrollAnchor(): ScrollAnchor | null {
	if (typeof window === "undefined") return null;
	if (pendingAnchor !== undefined) return pendingAnchor;

	pendingAnchor = null;
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		sessionStorage.removeItem(STORAGE_KEY);
		if (!raw || !isReload() || window.location.hash.length > 1) {
			return pendingAnchor;
		}
		const anchor = JSON.parse(raw) as ScrollAnchor;
		if (anchor.path === window.location.pathname) pendingAnchor = anchor;
	} catch {
		// Storage unavailable — fall back to native behaviour.
	}

	if (pendingAnchor) window.history.scrollRestoration = "manual";
	return pendingAnchor;
}

/** Saves which deferred section is at the top of the viewport. */
export function saveReloadScrollAnchor() {
	// Reloaded again before the previous restore finished: the page is still
	// at the top, so keep the original anchor instead of saving that.
	if (pendingAnchor) {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pendingAnchor));
		} catch {
			// Ignore — restoration is best effort.
		}
		return;
	}

	const sections = document.querySelectorAll<HTMLElement>(`[${SECTION_ATTR}]`);
	let sectionId: string | null = null;
	let offset = window.scrollY;

	for (const el of sections) {
		const top = el.getBoundingClientRect().top + window.scrollY;
		if (top <= window.scrollY + 1 && el.id) {
			sectionId = el.id;
			offset = window.scrollY - top;
		}
	}

	try {
		sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ path: window.location.pathname, sectionId, offset }),
		);
	} catch {
		// Ignore — restoration is best effort.
	}
}

export { SECTION_ATTR as DEFERRED_SECTION_ATTR };

/** Drops the anchor once restoration is done (or abandoned). */
export function clearReloadScrollAnchor() {
	pendingAnchor = null;
}
