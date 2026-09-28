"use client";

import { motion, useReducedMotion } from "motion/react";
import WorldMap from "@/components/ui/world-map";
import {
	appleRevealEase,
	revealTransition,
	sectionItemTransition,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import { useCopy } from "@/lib/copy";
import SectionHead from "./section-head";

const PARTNERSHIP_HUB = { lat: 32.1533, lng: 17.1683 } as const;

const PARTNERSHIP_ROUTES = [
	{ start: PARTNERSHIP_HUB, end: { lat: 27.7128, lng: -77.006 } },
	{ start: PARTNERSHIP_HUB, end: { lat: 41.8566, lng: 5.3522 } },
	{ start: PARTNERSHIP_HUB, end: { lat: 29.7749, lng: -122.4194 } },
	{ start: PARTNERSHIP_HUB, end: { lat: -58.8136, lng: 144.9631 } },
	{ start: PARTNERSHIP_HUB, end: { lat: 46.5074, lng: -2.2978 } },
	{ start: PARTNERSHIP_HUB, end: { lat: 5.2048, lng: 55.9708 } },
] as const;

export default function GlobalPartnerships() {
	const t = useCopy("home.global");
	const { ref, isRevealed, shouldAnimate } = useSectionReveal();
	const shouldReduceMotion = useReducedMotion();

	return (
		<section
			ref={ref}
			className="home-section home-feature-alt relative overflow-visible"
			style={{
				paddingTop: "var(--home-section-y-tight)",
				paddingBottom: "1.1rem",
			}}
		>
			<div className="home-wrap relative z-1">
				<motion.div
					initial={
						shouldReduceMotion || !shouldAnimate
							? false
							: sectionRevealItem.hidden
					}
					animate={
						isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden
					}
					transition={sectionItemTransition(
						shouldAnimate,
						0,
						!!shouldReduceMotion,
					)}
				>
					<SectionHead
						eyebrow={t("eyebrow")}
						headline={t("headline")}
						description={t("description")}
						centered
						className="[&_.home-eyebrow]:text-(--home-eyebrow-highlight) [&_.home-eyebrow]:before:bg-(--home-eyebrow-highlight)"
					/>
				</motion.div>
			</div>

			<motion.div
				className="relative z-1 mt-(--home-stack) w-full home-inline-x max-md:mt-(--home-stack-sm)"
				initial={
					shouldReduceMotion || !shouldAnimate
						? false
						: sectionRevealItem.hidden
				}
				animate={
					isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden
				}
				transition={revealTransition(shouldAnimate, {
					duration: 0.55,
					ease: appleRevealEase,
					delay: 0.1,
				})}
			>
				<WorldMap dots={[...PARTNERSHIP_ROUTES]} />
			</motion.div>
		</section>
	);
}
