"use client";

import dynamic from "next/dynamic";
import {
	type ComponentType,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	DEFERRED_SECTION_ATTR,
	getReloadScrollAnchor,
} from "@/lib/reload-scroll-restore";

type SectionLoader = () => Promise<{ default: ComponentType }>;

/**
 * True when the URL hash points at any deferred section (or something nested
 * in one, e.g. #core-services-2). Every section then mounts up front: if the
 * ones above the target stayed placeholders, they would grow mid-scroll and
 * push the target out from under the scroll position.
 */
function hashTargetsDeferredSection(): boolean {
	if (typeof window === "undefined") return false;
	const hash = window.location.hash.slice(1);
	if (!hash) return false;

	return [
		...document.querySelectorAll<HTMLElement>(`[${DEFERRED_SECTION_ATTR}]`),
	].some(({ id }) => id && (hash === id || hash.startsWith(`${id}-`)));
}

/**
 * Wait until the main thread is quiet so below-fold JS does not inflate TBT
 * during the Lighthouse lab window. Falls back after a short timeout.
 */
function whenMainThreadIdle(timeoutMs = 2500): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window.requestIdleCallback === "function") {
			window.requestIdleCallback(() => resolve(), { timeout: timeoutMs });
			return;
		}

		window.setTimeout(resolve, Math.min(timeoutMs, 400));
	});
}

export function createDeferredHomeSection(
	loader: SectionLoader,
	placeholderMinHeight = "40vh",
	id?: string,
) {
	const Section = dynamic(loader, { ssr: false });

	return function DeferredHomeSection() {
		const ref = useRef<HTMLDivElement>(null);
		const [nearViewport, setNearViewport] = useState(false);
		const [idleReady, setIdleReady] = useState(false);
		const [forceMount, setForceMount] = useState(false);

		useLayoutEffect(() => {
			// On reload, mount every section so the restored scroll position
			// lands on real content instead of placeholder heights.
			if (hashTargetsDeferredSection() || getReloadScrollAnchor()) {
				setForceMount(true);
			}

			// In-page hash links (e.g. nav "Contact") need the same treatment.
			const onHashChange = () => {
				if (hashTargetsDeferredSection()) setForceMount(true);
			};
			window.addEventListener("hashchange", onHashChange);
			return () => window.removeEventListener("hashchange", onHashChange);
		}, []);

		useEffect(() => {
			if (forceMount) {
				setIdleReady(true);
				return;
			}

			let cancelled = false;

			const arm = () => {
				void whenMainThreadIdle().then(() => {
					if (!cancelled) setIdleReady(true);
				});
			};

			if (document.readyState === "complete") {
				arm();
			} else {
				window.addEventListener("load", arm, { once: true });
			}

			return () => {
				cancelled = true;
				window.removeEventListener("load", arm);
			};
		}, [forceMount]);

		useEffect(() => {
			const node = ref.current;
			if (!node || forceMount) return;

			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry?.isIntersecting) {
						setNearViewport(true);
						observer.disconnect();
					}
				},
				{ rootMargin: "120px 0px" },
			);

			observer.observe(node);
			return () => observer.disconnect();
		}, [forceMount]);

		const shouldMount = forceMount || (idleReady && nearViewport);

		return (
			<div
				id={id}
				ref={ref}
				{...{ [DEFERRED_SECTION_ATTR]: "" }}
				className={forceMount ? "deferred-section--active" : undefined}
				style={shouldMount ? undefined : { minHeight: placeholderMinHeight }}
			>
				{shouldMount && <Section />}
			</div>
		);
	};
}
