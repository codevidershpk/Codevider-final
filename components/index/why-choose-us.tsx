"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCopy } from "@/lib/copy";
import {
	sectionItemTransition,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import SectionHead from "./section-head";

const PILLARS = ["collaboration", "efficiency", "expertise"] as const;

export default function WhyChooseUs() {
	const t = useCopy("home.why_choose");
	const { ref, isRevealed, shouldAnimate } = useSectionReveal();
	const shouldReduceMotion = useReducedMotion();

	const motionProps = (delay: number) => ({
		initial:
			shouldReduceMotion || !shouldAnimate ? false : sectionRevealItem.hidden,
		animate: isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden,
		transition: sectionItemTransition(
			shouldAnimate,
			delay,
			!!shouldReduceMotion,
		),
	});

	return (
		<section ref={ref} className="home-section">
			<div className="home-wrap">
				<motion.div {...motionProps(0)}>
					<SectionHead
						eyebrow={t("eyebrow")}
						headline={t("headline")}
						description={t("description")}
						className="max-w-160 max-sm:mx-0 max-sm:max-w-none [&_.home-eyebrow]:max-sm:justify-start"
						descriptionClassName="mt-5 text-[0.9375rem] sm:text-base"
					/>
				</motion.div>

				<div className="home-section-lead why-choose">
					<motion.aside
						{...motionProps(0.08)}
						className="why-choose-proof h-full"
					>
						<p className="why-choose-proof__label">{t("proof_label")}</p>
						<p className="why-choose-proof__year font-(family-name:--mono) tabular-nums">
							{t("proof_year")}
						</p>
						<p className="why-choose-proof__lede">{t("proof_description")}</p>
						<p className="why-choose-proof__aside min-[960px]:mt-5!">
							{t("proof_aside")}
						</p>
						<div className="mt-6 self-stretch min-[960px]:mt-auto min-[960px]:pt-8">
							<Link
								href="https://calendly.com/codevider/pasho"
								className="svc-cta__btn group w-full min-h-12 justify-center py-3.5 pl-7 pr-6.5 text-[15px]"
							>
								{t("cta")}
								<ArrowUpRight
									className={
										shouldReduceMotion
											? "size-4 shrink-0"
											: "size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
									}
									aria-hidden
								/>
							</Link>
						</div>
					</motion.aside>

					<div className="why-choose-pillars" role="list">
						{PILLARS.map((id, index) => (
							<motion.article
								key={id}
								role="listitem"
								{...motionProps(0.16 + index * 0.08)}
								className="why-choose-pillar"
							>
								<h3 className="text-balance">{t(`pillars.${id}.title`)}</h3>
								<p className="text-pretty">{t(`pillars.${id}.description`)}</p>
							</motion.article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
