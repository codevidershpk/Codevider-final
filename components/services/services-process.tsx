"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useRef } from "react";
import SectionHead from "@/components/index/section-head";

const STEP_IDS = [
	"discovery",
	"team_selection",
	"agile_delivery",
	"test_deploy",
] as const;

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function ServicesProcess() {
	const t = useCopy("services.process");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();

	return (
		<section ref={ref} id="how-we-work" className="svc-process">
			<div className="home-wrap">
				<SectionHead
					headline={t("headline")}
					description={t("description")}
					centered
					className="svc-process__head"
				/>

				<div className="svc-steps">
					{STEP_IDS.map((id, index) => {
						const transition = shouldReduceMotion
							? { duration: 0 }
							: { duration: 0.5, ease: revealEase, delay: index * 0.1 };

						return (
							<motion.div
								key={id}
								className="svc-step"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
								animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={transition}
							>
								<div className="svc-step__bar" aria-hidden />
								<h3 className="svc-step__title">{t(`steps.${id}.title`)}</h3>
								<p className="svc-step__desc">{t(`steps.${id}.description`)}</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
