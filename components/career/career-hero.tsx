"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { useRevealInView } from "@/hooks/use-page-end";
import { useCopy } from "@/lib/copy";

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function CareerHero() {
	const t = useCopy("career.hero");
	const ref = useRef<HTMLElement>(null);
	const inView = useRevealInView(ref, { once: true, margin: "-8% 0px" });
	const shouldReduceMotion = useReducedMotion();

	const stagger = (index: number) =>
		shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.55, ease: revealEase, delay: index * 0.08 };

	return (
		<section ref={ref} className="svc-hero">
			<div className="svc-hero__glow" aria-hidden />
			<div className="home-wrap relative z-10 pt-[clamp(8rem,14vw,11rem)] pb-[clamp(4rem,8vw,6rem)]">
				<motion.h1
					className="svc-hero__title max-w-[22ch]"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
					transition={stagger(0)}
				>
					{t("headline")}
				</motion.h1>

				<motion.p
					className="svc-hero__lead"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
					transition={stagger(1)}
				>
					{t("lead")}
				</motion.p>
			</div>
		</section>
	);
}
