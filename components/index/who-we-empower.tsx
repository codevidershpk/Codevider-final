"use client";

import {
	Bot,
	Building2,
	Cloud,
	Code,
	CreditCard,
	Database,
	MessageSquare,
	Smartphone,
	Workflow,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import {
	sectionItemTransition,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import BorderGlow from "@/components/ui/border-glow";
import { useTheme } from "@/components/providers/ThemeProvider";
import SectionHead from "./section-head";

const CELLS = [
	{ id: "ai", icon: Bot, area: "ai", featured: true },
	{ id: "automation", icon: Workflow, area: "automation", featured: false },
	{ id: "cloud", icon: Cloud, area: "cloud", featured: false },
	{ id: "mobile", icon: Smartphone, area: "mobile", featured: false },
	{ id: "data", icon: Database, area: "data", featured: false },
	{ id: "custom", icon: Code, area: "custom", featured: false },
	{ id: "enterprise", icon: Building2, area: "enterprise", featured: false },
	{ id: "fintech", icon: CreditCard, area: "fintech", featured: false },
	{ id: "crm", icon: MessageSquare, area: "crm", featured: false },
] as const;

export default function WhoWeEmpower() {
	const t = useCopy("home.empower");
	const { theme } = useTheme();
	const isDark = theme === "dark";
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
		<section
			ref={ref}
			className="home-section home-section--tight home-feature-alt"
		>
			<div className="home-wrap">
				<motion.div {...motionProps(0)}>
					<SectionHead
						eyebrow={t("eyebrow")}
						headline={t("headline")}
						description={t("description")}
						centered
						className="max-sm:mx-0 max-sm:max-w-none max-sm:text-left [&_.home-eyebrow]:max-sm:justify-start [&_p]:max-sm:mx-0"
						descriptionClassName="text-[0.9375rem] sm:text-base"
					/>
				</motion.div>

				<div className="home-section-lead home-empower">
					<div className="home-empower-bento" role="list">
						{CELLS.map(({ id, icon: Icon, area, featured }, index) => {
							const body = (
								<>
									<div className="home-ecard-head">
										<div className="home-ecard-icon">
											<Icon
												className={featured ? "size-4 md:size-5" : "size-4"}
												strokeWidth={1.75}
												aria-hidden
											/>
										</div>
										<h3>{t(`cards.${id}.title`)}</h3>
									</div>
									<p>{t(`cards.${id}.description`)}</p>
								</>
							);

							return (
								<motion.div
									key={id}
									role="listitem"
									{...motionProps(0.1 + index * 0.08)}
									className="home-empower-cell"
									style={{ gridArea: area }}
								>
									{featured ? (
										<BorderGlow
											className="home-ecard home-ecard--featured"
											alwaysOn
											borderRadius={12}
											backgroundColor="color-mix(in srgb, var(--dash-brand) 6%, var(--bg))"
											glowColor={isDark ? "221 62 58" : "221 100 57"}
											colors={
												isDark
													? ["#1852e6", "#76f9d3", "#7a9feb"]
													: ["#2469ff", "#32fcb6", "#6b9bff"]
											}
											glowRadius={isDark ? 40 : 52}
											glowIntensity={isDark ? 0.85 : 1.75}
											fillOpacity={isDark ? 0.48 : 0.7}
										>
											{body}
										</BorderGlow>
									) : (
										<article className="home-ecard">{body}</article>
									)}
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
