"use client";

import { useReducedMotion } from "motion/react";
import HeroBlobs from "@/components/index/hero-blobs";

/** Same veil + drifting brand blobs as the homepage hero. */
export function UkHeroBackdrop() {
	const reducedMotion = useReducedMotion();

	return (
		<>
			<div className="home-hero__veil" aria-hidden />
			<HeroBlobs paused={reducedMotion ?? false} />
		</>
	);
}
