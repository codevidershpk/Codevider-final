"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { useRevealInView } from "@/hooks/use-page-end";
import { useCopy } from "@/lib/copy";

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function AboutJoinCta() {
	const t = useCopy("about.join");
	const ref = useRef<HTMLElement>(null);
	const inView = useRevealInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();

	return (
		<section ref={ref} className="home-section home-section--tight">
			<div className="home-wrap">
				<motion.div
					className="about-join-cta"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
					transition={
						shouldReduceMotion
							? { duration: 0 }
							: { duration: 0.6, ease: revealEase }
					}
				>
					<h2 className="about-join-cta__title">{t("headline")}</h2>
					<p className="about-join-cta__description">{t("description")}</p>
					<Link
						href="/career"
						className="home-brand-btn group about-join-cta__btn inline-flex min-h-11 items-center gap-2 px-7 py-3.5 text-sm"
					>
						{t("cta")}
						<ArrowRight
							className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
