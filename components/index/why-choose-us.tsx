"use client";

import { Check, GitMerge, Map, Video } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
	sectionItemTransition,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import { useCopy } from "@/lib/copy";
import SectionHead from "./section-head";

const STATS = ["since", "projects", "engineers", "ip"] as const;
const PILLARS = ["collaboration", "efficiency", "expertise"] as const;
const FEED_ICONS = [GitMerge, Video, Map];

type Translate = ReturnType<typeof useCopy>;

const surface =
	"bg-white shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--text-h)_9%,transparent),0_1px_2px_oklch(0_0_0/0.04),0_8px_24px_-12px_oklch(0_0_0/0.08)] dark:bg-[color-mix(in_srgb,var(--text-h)_3%,var(--bg))] dark:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--text-h)_9%,transparent)]";
const chip =
	"flex items-center gap-2.5 bg-(--bg) text-(--text-h) shadow-[0_0_0_1px_color-mix(in_srgb,var(--text-h)_8%,transparent)]";

function CollaborationVisual({ t }: { t: Translate }) {
	const feed = t.raw("pillars.collaboration.visual.feed") as string[];
	return (
		<ul className="flex flex-col gap-2">
			{feed.map((item, i) => {
				const Icon = FEED_ICONS[i % FEED_ICONS.length];
				return (
					<li key={item} className={`${chip} rounded-[10px] px-3 py-2`}>
						<span className="grid size-6 shrink-0 place-items-center rounded-md bg-[color-mix(in_srgb,var(--dash-brand)_14%,transparent)] text-(--dash-brand)">
							<Icon className="size-3.5" />
						</span>
						<span className="truncate">{item}</span>
						<Check className="ml-auto size-3.5 shrink-0 text-(--brand-mint)" />
					</li>
				);
			})}
		</ul>
	);
}

function EfficiencyVisual({ t }: { t: Translate }) {
	const v = (k: string) => t(`pillars.efficiency.visual.${k}`);
	const rows = [
		{
			label: v("typical"),
			value: v("typical_value"),
			width: "100%",
			us: false,
		},
		{ label: v("us"), value: v("us_value"), width: "17%", us: true },
	];
	return (
		<div className="flex flex-col gap-4.5">
			{rows.map((row) => (
				<div key={row.label}>
					<div
						className={`mb-1.5 flex justify-between ${row.us ? "font-semibold text-(--text-h)" : ""}`}
					>
						<span>{row.label}</span>
						<span className="font-(family-name:--mono)">{row.value}</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text-h)_7%,transparent)]">
						<span
							className={`block h-full rounded-full ${row.us ? "bg-linear-to-r from-(--dash-brand) to-(--brand-mint)" : "bg-[color-mix(in_srgb,var(--text-h)_22%,transparent)]"}`}
							style={{ width: row.width }}
						/>
					</div>
				</div>
			))}
		</div>
	);
}

function ExpertiseVisual({ t }: { t: Translate }) {
	const roles = t.raw("pillars.expertise.visual.roles") as string[];
	return (
		<ul className="flex flex-wrap gap-2">
			{roles.map((role) => (
				<li key={role} className={`${chip} rounded-full px-3 py-1.5`}>
					{role}
				</li>
			))}
		</ul>
	);
}

const VISUALS = {
	collaboration: CollaborationVisual,
	efficiency: EfficiencyVisual,
	expertise: ExpertiseVisual,
};

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
						centered
						headline={t("headline")}
						description={t("description")}
						className="max-w-160"
						descriptionClassName="mt-5 text-[0.9375rem] sm:text-base"
					/>
				</motion.div>

				<div className="home-section-lead grid gap-4">
					<div className="grid gap-4 min-[960px]:grid-cols-3" role="list">
						{PILLARS.map((id, index) => {
							const Visual = VISUALS[id];
							return (
								<motion.article
									key={id}
									role="listitem"
									{...motionProps(0.08 + index * 0.08)}
									className={`${surface} flex flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--dash-brand)_40%,transparent)] dark:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--dash-brand)_40%,transparent)]`}
								>
									<div
										aria-hidden
										className="flex min-h-44 flex-col justify-center border-b border-[color-mix(in_srgb,var(--text-h)_8%,transparent)] bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_srgb,var(--dash-brand)_6%,transparent),transparent_60%)] dark:bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_srgb,var(--dash-brand)_14%,transparent),transparent_60%)] p-5 text-[0.8125rem] text-(--text-muted)"
									>
										<Visual t={t} />
									</div>
									<div className="p-[clamp(1.25rem,2.5vw,1.75rem)] pt-5">
										<span className="font-(family-name:--mono) text-xs text-(--dash-brand)">
											0{index + 1}
										</span>
										<h3 className="mt-2 text-balance text-[clamp(1.125rem,2vw,1.25rem)] font-semibold leading-snug tracking-[-0.02em] text-(--text-h)">
											{t(`pillars.${id}.title`)}
										</h3>
										<p className="mt-2 text-pretty text-[0.9375rem] leading-relaxed text-(--text)">
											{t(`pillars.${id}.description`)}
										</p>
									</div>
								</motion.article>
							);
						})}
					</div>

					<motion.dl
						{...motionProps(0.4)}
						className="mt-4 grid grid-cols-2 gap-y-6 border-t border-[color-mix(in_srgb,var(--text-h)_10%,transparent)] pt-6 md:grid-cols-4"
					>
						{STATS.map((id) => (
							<div
								key={id}
								className="flex flex-col gap-1 px-5 first:pl-0 max-md:odd:pl-0 md:border-l md:border-[color-mix(in_srgb,var(--text-h)_10%,transparent)] md:first:border-l-0"
							>
								<dt className="text-[0.8125rem] leading-snug text-(--text-muted)">
									{t(`stats.${id}.label`)}
								</dt>
								<dd className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-(--text-h)">
									{t(`stats.${id}.value`)}
								</dd>
							</div>
						))}
					</motion.dl>
				</div>
			</div>
		</section>
	);
}
