"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/use-section-reveal";

const INTERVAL_MS = 3200;

const enterTransition = {
	type: "spring" as const,
	stiffness: 120,
	damping: 18,
	mass: 0.85,
};

const exitTransition = {
	duration: 0.35,
	ease: [0.4, 0, 0.2, 1] as const,
};

/**
 * Animated rotating word component for hero headline.
 *
 * @returns The rotating industry word component.
 */
interface RotatingWordProps {
	words: string[];
	/** Skip rotation and motion — used on mobile / lite hero. */
	staticMode?: boolean;
}

export default function RotatingWord({
	words,
	staticMode = false,
}: RotatingWordProps) {
	const [shuffled, setShuffled] = useState(words);
	const [index, setIndex] = useState(0);
	const mounted = useMounted();

	const wordsKey = words.join("\u0000");

	// Keep the first (server-rendered) word in place so it stays visible on
	// load; only shuffle the words that come after it.
	useEffect(() => {
		const [first, ...rest] = words;
		for (let i = rest.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[rest[i], rest[j]] = [rest[j], rest[i]];
		}
		setShuffled(first === undefined ? [] : [first, ...rest]);
		setIndex(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wordsKey]);
	const shouldReduceMotion = useReducedMotion();

	useEffect(() => {
		if (staticMode || shouldReduceMotion) return;

		const interval = window.setInterval(() => {
			setIndex((current) => (current + 1) % shuffled.length);
		}, INTERVAL_MS);

		return () => window.clearInterval(interval);
	}, [staticMode, shouldReduceMotion, shuffled]);

	const word = shuffled[index];

	if (staticMode) {
		return (
			<span className="relative inline-grid align-bottom font-sans text-(--hero-accent-text)">
				<span className="col-start-1 row-start-1 overflow-hidden">
					<span className="block italic font-serif font-bold">{words[0]}</span>
				</span>
			</span>
		);
	}

	return (
		<span
			className="relative inline-grid align-bottom font-sans text-(--hero-accent-text)"
			aria-live="polite"
		>
			<span className="col-start-1 row-start-1 inline-grid" aria-hidden>
				{shuffled.map((w) => (
					<span
						key={w}
						className="invisible col-start-1 row-start-1 italic font-serif font-bold"
					>
						{w}
					</span>
				))}
			</span>

			<span className="col-start-1 row-start-1 overflow-hidden">
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={word}
						className="block italic font-serif font-bold"
						initial={
							!mounted || shouldReduceMotion
								? false
								: index === 0
									? false
									: { y: "100%", opacity: 0 }
						}
						animate={{ y: 0, opacity: 1 }}
						exit={
							shouldReduceMotion
								? { opacity: 0, transition: { duration: 0.15 } }
								: {
										y: "-100%",
										opacity: 0,
										transition: exitTransition,
									}
						}
						transition={
							shouldReduceMotion ? { duration: 0.15 } : enterTransition
						}
					>
						{word}
					</motion.span>
				</AnimatePresence>
			</span>
		</span>
	);
}
