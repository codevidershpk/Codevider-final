"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useRef } from "react";

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function BlogHero() {
	const t = useCopy("blog.hero");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-8% 0px" });
	const shouldReduceMotion = useReducedMotion();

	const stagger = (index: number) =>
		shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.55, ease: revealEase, delay: index * 0.08 };

	return (
		<section ref={ref} className="svc-hero blog-hero">
			<div className="svc-hero__glow" aria-hidden />
			<div className="home-wrap relative z-10 pt-[clamp(5.5rem,10vw,7.5rem)] pb-[clamp(3.25rem,7vw,5rem)]">
				<motion.p
					className="home-eyebrow svc-hero__eyebrow"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
					transition={stagger(0)}
				>
					{t("eyebrow")}
				</motion.p>

				<motion.h1
					className="svc-hero__title blog-hero__title"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
					transition={stagger(1)}
				>
					{t("headline")}
				</motion.h1>

				<motion.p
					className="svc-hero__lead blog-hero__lead"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
					transition={stagger(2)}
				>
					{t("lead")}
				</motion.p>
			</div>
		</section>
	);
}
