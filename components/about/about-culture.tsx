"use client";

import { Code2, Eye, Users } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useRef } from "react";
import SectionHead from "@/components/index/section-head";

const PRINCIPLE_IDS = ["vision", "code", "team"] as const;

const PRINCIPLE_ICONS = {
	vision: Eye,
	code: Code2,
	team: Users,
} as const;

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function AboutCulture() {
	const t = useCopy("about.culture");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();

	return (
		<section
			ref={ref}
			id="our-culture"
			className="home-section home-section--tight home-feature-alt"
		>
			<div className="home-wrap">
				<SectionHead
					eyebrow={t("eyebrow")}
					headline={t("headline")}
					description={t("description")}
					centered
				/>

				<div className="about-principles home-section-lead">
					{PRINCIPLE_IDS.map((id, index) => {
						const Icon = PRINCIPLE_ICONS[id];
						const transition = shouldReduceMotion
							? { duration: 0 }
							: { duration: 0.5, ease: revealEase, delay: index * 0.1 };

						return (
							<motion.article
								key={id}
								className="home-ecard home-card-body"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
								animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={transition}
							>
								<div className="home-ecard-icon">
									<Icon className="size-[22px]" aria-hidden />
								</div>
								<h3 className="text-xl font-semibold tracking-[-0.01em] text-(--text-h)">
									{t(`principles.${id}.title`)}
								</h3>
								<p className="text-pretty text-[15px] leading-relaxed text-(--text)">
									{t(`principles.${id}.description`)}
								</p>
							</motion.article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
