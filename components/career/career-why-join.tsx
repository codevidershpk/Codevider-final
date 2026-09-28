"use client";

import { BarChart3, FileCheck, Users } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import SectionHead from "@/components/index/section-head";
import { useCopy } from "@/lib/copy";

const VALUE_IDS = ["ownership", "growth", "culture"] as const;

const VALUE_ICONS = {
	ownership: FileCheck,
	growth: BarChart3,
	culture: Users,
} as const;

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function CareerWhyJoin() {
	const t = useCopy("career.why_join");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();

	return (
		<section ref={ref} className="home-section home-section--tight">
			<div className="home-wrap">
				<SectionHead eyebrow={t("eyebrow")} headline={t("headline")} centered />

				<div className="home-section-lead grid gap-5 md:grid-cols-3">
					{VALUE_IDS.map((id, index) => {
						const Icon = VALUE_ICONS[id];
						const transition = shouldReduceMotion
							? { duration: 0 }
							: { duration: 0.5, ease: revealEase, delay: index * 0.1 };

						return (
							<motion.article
								key={id}
								className="home-ecard home-card-body text-left"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
								animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={transition}
							>
								<div className="flex items-center gap-3">
									<div className="home-ecard-icon shrink-0">
										<Icon className="size-[22px]" aria-hidden />
									</div>
									<h3 className="text-xl font-semibold text-balance tracking-[-0.01em] text-(--text-h)">
										{t(`values.${id}.title`)}
									</h3>
								</div>
								<p className="text-pretty text-[15px] leading-relaxed text-(--text)">
									{t(`values.${id}.description`)}
								</p>
							</motion.article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
