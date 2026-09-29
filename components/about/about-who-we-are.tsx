"use client";

import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useRef } from "react";
import SectionHead from "@/components/index/section-head";
import Link from "next/link";

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function AboutWhoWeAre() {
	const t = useCopy("about.who_we_are");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();

	const stagger = (index: number) =>
		shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.5, ease: revealEase, delay: index * 0.1 };

	return (
		<section ref={ref} id="who-we-are" className="home-section">
			<div className="home-wrap">
				<SectionHead headline={t("headline")} />

				<div className="about-cols  home-section-lead">
					<motion.p
						className="text-pretty text-base leading-relaxed text-(--text) sm:text-[17px]"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
						transition={stagger(0)}
					>
						{t("paragraph_1")}
					</motion.p>
					<motion.p
						className="text-pretty text-base leading-relaxed text-(--text) sm:text-[17px]"
						initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
						transition={stagger(1)}
					>
						{t("paragraph_2", { value: 20 })}
					</motion.p>
				</div>

				<motion.div
					className="mt-9"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={stagger(2)}
				>
					<Link
						href={{ pathname: "/", hash: "contact" }}
						scroll={false}
						className="svc-cta__btn px-7 py-4 text-[15px]"
					>
						{t("cta")}
						<ArrowRight className="size-4" aria-hidden />
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
