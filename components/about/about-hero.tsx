"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { useRevealInView } from "@/hooks/use-page-end";
import { useCopy } from "@/lib/copy";

const revealEase = [0.22, 1, 0.36, 1] as const;

const META_KEYS = ["meta_years", "meta_projects", "meta_location"] as const;

export default function AboutHero() {
	const t = useCopy("about.hero");
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
			<div className="home-wrap relative z-10 pt-[clamp(6.5rem,12vw,9rem)] pb-[clamp(4rem,8vw,6rem)]">
				<motion.h1
					className="svc-hero__title max-w-[18ch]"
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

				<motion.ul
					className="svc-hero__meta"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
					transition={stagger(2)}
				>
					{META_KEYS.map((key) => (
						<li key={key}>
							<span className="svc-hero__dot" aria-hidden />
							{t(key)}
						</li>
					))}
				</motion.ul>
			</div>
		</section>
	);
}
