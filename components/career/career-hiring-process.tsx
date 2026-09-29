"use client";

import { Award, Code2, FileText, Users } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import SectionHead from "@/components/index/section-head";
import { useCopy } from "@/lib/copy";

const STEP_IDS = [
	"application_review",
	"hr_interview",
	"technical_review",
	"offer",
] as const;

const STEP_ICONS = {
	application_review: FileText,
	hr_interview: Users,
	technical_review: Code2,
	offer: Award,
} as const;

const STEP_NUMBERS = ["01", "02", "03", "04"] as const;

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function CareerHiringProcess() {
	const t = useCopy("career.hiring");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();

	return (
		<section ref={ref} className="career-hiring">
			<div className="home-wrap">
				<SectionHead
					headline={t("headline")}
					description={t("description")}
					centered
					className="career-hiring__head"
				/>

				<div className="career-hiring__grid">
					{STEP_IDS.map((id, index) => {
						const Icon = STEP_ICONS[id];
						const transition = shouldReduceMotion
							? { duration: 0 }
							: { duration: 0.5, ease: revealEase, delay: index * 0.1 };

						return (
							<motion.article
								key={id}
								className="career-hiring__card"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
								animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={transition}
							>
								<div className="career-hiring__card-head">
									<span className="career-hiring__icon">
										<Icon className="size-[22px]" aria-hidden />
									</span>
									<span className="career-hiring__num" aria-hidden>
										{STEP_NUMBERS[index]}
									</span>
								</div>
								<h3 className="career-hiring__title">
									{t(`steps.${id}.title`)}
								</h3>
								<p className="career-hiring__desc">
									{t(`steps.${id}.description`)}
								</p>
							</motion.article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
