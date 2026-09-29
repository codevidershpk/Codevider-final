"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useRef } from "react";

const revealEase = [0.22, 1, 0.36, 1] as const;
const STAGGER_MS = 0.1;

type LegalHeroProps = {
	namespace: "legal.terms" | "legal.privacy";
};

export default function LegalHero({ namespace }: LegalHeroProps) {
	const t = useCopy(namespace);
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-8% 0px" });
	const shouldReduceMotion = useReducedMotion();
	const introParagraphs = t.raw("intro_paragraphs");

	const stagger = (index: number) =>
		shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.55, ease: revealEase, delay: index * STAGGER_MS };

	return (
		<section ref={ref} className="svc-hero">
			<div className="svc-hero__glow" aria-hidden />
			<div className="home-wrap relative z-10 pt-[clamp(6.5rem,12vw,9rem)] pb-[clamp(4rem,8vw,6rem)]">
				<motion.h1
					className="svc-hero__title max-w-[min(22ch,100%)] text-balance"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
					transition={stagger(0)}
				>
					{t("title")}
				</motion.h1>

				<motion.p
					className="legal-doc__updated"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
					transition={stagger(1)}
				>
					{t("last_updated")}
				</motion.p>

				{Array.isArray(introParagraphs)
					? introParagraphs.map((paragraph, index) => (
							<motion.p
								key={`${index}-${String(paragraph).slice(0, 24)}`}
								className="svc-hero__lead text-pretty"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
								animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
								transition={stagger(index + 2)}
							>
								{String(paragraph)}
							</motion.p>
						))
					: null}
			</div>
		</section>
	);
}
