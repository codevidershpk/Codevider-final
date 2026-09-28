"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import {
	sectionRevealItem,
	sectionRevealStagger,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import Link from "next/link";

const itemVariants = sectionRevealItem;

const STATS = [
	{
		valueKey: "stat_global_partnerships_value",
		labelKey: "stat_global_partnerships",
		value: 30,
	},
	{
		valueKey: "stat_delivery_velocity_value",
		labelKey: "stat_delivery_velocity",
		value: 60,
	},
	{
		valueKey: "stat_embed_value",
		labelKey: "stat_embed",
		value: 2,
	},
] as const;

export default function WhoWeAre() {
	const t = useCopy("home");
	const points = t.raw("who_we_are_points") as string[];
	const {
		ref: sectionRef,
		isRevealed,
		shouldAnimate,
	} = useSectionReveal({
		margin: "-10% 0px -10% 0px",
	});
	const shouldReduceMotion = useReducedMotion();
	const motionState = shouldReduceMotion || !shouldAnimate ? false : "hidden";

	return (
		<section
			ref={sectionRef}
			aria-labelledby="who-we-are-heading"
			className="home-section home-feature-alt"
		>
			<div className="home-wrap grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14">
				<motion.div
					initial={motionState}
					animate={isRevealed ? "visible" : "hidden"}
					variants={sectionRevealStagger}
				>
					<motion.p className="home-eyebrow" variants={itemVariants}>
						{t("who_we_are_eyebrow")}
					</motion.p>

					<motion.h2
						id="who-we-are-heading"
						className="mt-3.5 max-w-xl font-sans text-balance text-[clamp(1.75rem,4vw,2.6rem)] leading-[1.12] tracking-tight text-(--text-h)"
						variants={itemVariants}
					>
						{t("who_we_are_headline")}
					</motion.h2>

					<motion.p
						className="mt-5 max-w-[65ch] text-pretty text-[1.0625rem] leading-relaxed text-(--text) sm:text-[1.125rem]"
						variants={itemVariants}
					>
						{t("who_we_are_description")}
					</motion.p>

					<motion.ul
						className="mt-6 grid max-w-xl gap-3"
						variants={sectionRevealStagger}
					>
						{points.map((point) => (
							<motion.li
								key={point}
								variants={itemVariants}
								className="flex items-start gap-3 text-pretty text-sm leading-relaxed text-(--text)"
							>
								<span className="mt-1 grid size-3.5 shrink-0 place-items-center rounded-full bg-(--dash-brand-bg) text-(--dash-brand)">
									<Check className="size-2" strokeWidth={3} aria-hidden />
								</span>
								{point}
							</motion.li>
						))}
					</motion.ul>

					<motion.div variants={itemVariants} className="mt-8">
						<Link href="/about" className="home-link-arrow">
							{t("read_more_about_us")}
							<ArrowUpRight className="size-[15px]" aria-hidden />
						</Link>
					</motion.div>
				</motion.div>

				<motion.div
					className="home-demo w-full"
					initial={motionState}
					animate={isRevealed ? "visible" : "hidden"}
					variants={sectionRevealStagger}
				>
					<dl className="divide-y divide-[color-mix(in_srgb,var(--text-h)_8%,transparent)]">
						{STATS.map(({ valueKey, labelKey, value }) => (
							<motion.div
								key={valueKey}
								variants={itemVariants}
								className="flex items-center justify-between gap-6 px-6 py-6"
							>
								<dt className="max-w-[18rem] text-pretty text-sm leading-snug text-(--text-muted)">
									{t(labelKey, { value })}
								</dt>
								<dd className="shrink-0 font-sans text-[clamp(1.75rem,3vw,2.25rem)] font-medium tabular-nums tracking-tight text-(--dash-brand)">
									{t(valueKey, { value })}
								</dd>
							</motion.div>
						))}
					</dl>
				</motion.div>
			</div>
		</section>
	);
}
