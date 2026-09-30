"use client";

import {
	type UseInViewOptions,
	useInView,
	useReducedMotion,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePageEnd } from "@/hooks/use-page-end";

/**
 * Returns true only after the component has mounted on the client.
 * Use this to guard motion `initial` props so SSR HTML renders visible
 * (no opacity:0) and animations only start after hydration is complete,
 * eliminating the SSR→hydration layout shift.
 */
export function useMounted() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	return mounted;
}

/** Possible reveal states for a section. */
type RevealMode = "pending" | "instant" | "animate" | "waiting";

/** Options for useSectionReveal hook. */
export type SectionRevealOptions = {
	margin?: UseInViewOptions["margin"];
	amount?: UseInViewOptions["amount"];
};

/** Instant transition with zero duration. */
const instantRevealTransition = { duration: 0 } as const;

/** Apple-like ease — cubic-bezier(0.2, 0, 0, 1) */
export const appleRevealEase = [0.2, 0, 0, 1] as const;

/** Motion variant for a single revealed item. */
export const sectionRevealItem = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: appleRevealEase },
	},
} as const;

/** Motion variant for a container with staggered revealed items. */
export const sectionRevealStagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.1, delayChildren: 0.04 },
	},
} as const;

/**
 * Parses a margin string (percentage or pixels) into pixels for a given axis.
 *
 * @param value - Margin string (e.g., "10%", "50px")
 * @param axis - Axis (x or y)
 * @returns Margin in pixels
 */
function parseMargin(value: string, axis: "x" | "y") {
	if (value.endsWith("%")) {
		const size = axis === "y" ? window.innerHeight : window.innerWidth;
		return (parseFloat(value) / 100) * size;
	}

	return parseFloat(value) || 0;
}

/**
 * Converts a margin string into a root object for intersection calculation.
 *
 * @param margin - Margin string
 * @returns Root bounds object
 */
function getIntersectionRoot(margin: string) {
	const parts = margin.trim().split(/\s+/);
	const [top, right = top, bottom = top, left = right] = parts;

	return {
		top: parseMargin(top, "y"),
		right: parseMargin(right, "x"),
		bottom: parseMargin(bottom, "y"),
		left: parseMargin(left, "x"),
	};
}

/**
 * Calculates the visible ratio of an element within a root bounds.
 *
 * @param rect - Element bounding rectangle
 * @param root - Root bounds
 * @returns Visible ratio (0 to 1)
 */
function getVisibleRatio(
	rect: DOMRectReadOnly,
	root: { top: number; right: number; bottom: number; left: number },
) {
	const intersectionWidth = Math.max(
		0,
		Math.min(rect.right, root.right) - Math.max(rect.left, root.left),
	);
	const intersectionHeight = Math.max(
		0,
		Math.min(rect.bottom, root.bottom) - Math.max(rect.top, root.top),
	);
	const elementArea = rect.width * rect.height;

	if (elementArea <= 0) return 0;

	return (intersectionWidth * intersectionHeight) / elementArea;
}

/**
 * Determines the reveal mode for an element.
 *
 * @param el - Element to check
 * @param margin - Margin string for intersection
 * @param amount - Visibility amount threshold
 * @returns Reveal mode
 */
function getRevealMode(
	el: Element,
	margin: string,
	amount?: UseInViewOptions["amount"],
): Exclude<RevealMode, "pending"> {
	const rect = el.getBoundingClientRect();
	const margins = getIntersectionRoot(margin);
	const root = {
		top: margins.top,
		right: window.innerWidth + margins.right,
		bottom: window.innerHeight + margins.bottom,
		left: margins.left,
	};

	const visibleRatio = getVisibleRatio(rect, root);
	const threshold =
		amount === "all"
			? 1
			: amount === "some" || amount === undefined
				? 0
				: amount;
	const isIntersecting = visibleRatio > threshold;

	if (!isIntersecting) {
		return rect.bottom < root.top ? "instant" : "waiting";
	}

	return "animate";
}

/**
 * Hook to manage section reveal animations with SSR safety.
 *
 * @param options - Reveal options
 * @returns Ref and reveal state
 */
export function useSectionReveal<T extends Element = HTMLElement>(
	options: SectionRevealOptions = {},
) {
	const ref = useRef<T>(null);
	const [mode, setMode] = useState<RevealMode>("pending");
	const margin = options.margin ?? "-10% 0px";
	const marginForMeasure = typeof margin === "string" ? margin : "-10% 0px";
	const inViewport = useInView(ref, {
		once: true,
		margin,
		amount: options.amount,
	});
	const atPageEnd = usePageEnd();
	const inView = inViewport || atPageEnd;
	const shouldReduceMotion = useReducedMotion();

	useLayoutEffect(() => {
		let cancelled = false;

		const measure = () => {
			if (cancelled || !ref.current) return;
			setMode(getRevealMode(ref.current, marginForMeasure, options.amount));
		};

		// Measure before paint so above-viewport sections don't flash hidden.
		measure();

		// Re-measure after the browser finishes restoring scroll on refresh.
		requestAnimationFrame(() => {
			requestAnimationFrame(measure);
		});

		window.addEventListener("pageshow", measure);

		return () => {
			cancelled = true;
			window.removeEventListener("pageshow", measure);
		};
	}, [marginForMeasure, options.amount]);

	const isRevealed =
		shouldReduceMotion ||
		mode === "instant" ||
		mode === "animate" ||
		(mode === "waiting" && inView);

	const shouldAnimate =
		!shouldReduceMotion &&
		mode !== "pending" &&
		(mode === "animate" || (mode === "waiting" && inView));

	return { ref, isRevealed, shouldAnimate, mode };
}

/**
 * Returns a transition object that respects shouldAnimate flag.
 *
 * @param shouldAnimate - Whether to animate
 * @param transition - Transition to use when animating
 * @returns Transition object
 */
export function revealTransition<T extends object>(
	shouldAnimate: boolean,
	transition: T,
) {
	return shouldAnimate ? transition : instantRevealTransition;
}

/**
 * Standardized transition for section items with optional delay.
 *
 * @param shouldAnimate - Whether to animate
 * @param delay - Animation delay
 * @param shouldReduceMotion - Whether reduced motion is enabled
 * @returns Transition object
 */
export function sectionItemTransition(
	shouldAnimate: boolean,
	delay = 0,
	shouldReduceMotion = false,
) {
	return revealTransition(shouldAnimate, {
		duration: 0.55,
		ease: appleRevealEase,
		delay: shouldReduceMotion ? 0 : delay,
	});
}
