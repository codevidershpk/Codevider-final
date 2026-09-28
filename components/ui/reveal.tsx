"use client";

import { motion, useReducedMotion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	useContext,
} from "react";
import {
	appleRevealEase,
	revealTransition,
	type SectionRevealOptions,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";

type RevealState = {
	isRevealed: boolean;
	shouldAnimate: boolean;
	shouldReduceMotion: boolean;
};

/** Slightly slower than the homepage (0.55s) so the disclosure reads calmly. */
const REVEAL_DURATION = 0.8;
/** Stretches the per-item delays callers pass in. */
const REVEAL_STAGGER_SCALE = 1.5;
const REVEAL_VISIBLE = { opacity: 1, y: 0 } as const;

const RevealContext = createContext<RevealState | null>(null);

type Tag =
	| "div"
	| "section"
	| "article"
	| "header"
	| "ul"
	| "ol"
	| "li"
	| "p"
	| "h1"
	| "h2"
	| "h3"
	| "span"
	| "aside"
	| "figure"
	| "nav"
	| "footer"
	| "dl";

type GroupProps = {
	as?: Tag;
	options?: SectionRevealOptions;
	children: ReactNode;
} & Omit<ComponentProps<"div">, "ref" | "children">;

/**
 * Observes one element and lets every nested <Reveal> animate in together
 * (same progressive-disclosure rhythm as the homepage sections).
 */
export function RevealGroup({
	as = "div",
	options,
	children,
	...rest
}: GroupProps) {
	const { ref, isRevealed, shouldAnimate } =
		useSectionReveal<HTMLElement>(options);
	const shouldReduceMotion = !!useReducedMotion();
	const Component = as as "div";

	return (
		<RevealContext.Provider
			value={{ isRevealed, shouldAnimate, shouldReduceMotion }}
		>
			<Component ref={ref as React.Ref<HTMLDivElement>} {...rest}>
				{children}
			</Component>
		</RevealContext.Provider>
	);
}

type RevealProps = {
	as?: Tag;
	delay?: number;
	children?: ReactNode;
} & Omit<
	ComponentProps<typeof motion.div>,
	"ref" | "children" | "initial" | "animate" | "transition"
>;

/** Fades + lifts its children in once the surrounding <RevealGroup> is in view. */
export function Reveal({
	as = "div",
	delay = 0,
	children,
	...rest
}: RevealProps) {
	const ctx = useContext(RevealContext);
	const own = useSectionReveal<HTMLElement>();
	const ownReduce = !!useReducedMotion();
	const state = ctx ?? { ...own, shouldReduceMotion: ownReduce };
	const Component = motion[as] as typeof motion.div;

	return (
		<Component
			ref={ctx ? undefined : (own.ref as React.Ref<HTMLDivElement>)}
			initial={
				state.shouldReduceMotion || !state.shouldAnimate
					? false
					: sectionRevealItem.hidden
			}
			animate={state.isRevealed ? REVEAL_VISIBLE : sectionRevealItem.hidden}
			transition={revealTransition(state.shouldAnimate, {
				duration: REVEAL_DURATION,
				ease: appleRevealEase,
				delay: state.shouldReduceMotion ? 0 : delay * REVEAL_STAGGER_SCALE,
			})}
			{...rest}
		>
			{children}
		</Component>
	);
}
