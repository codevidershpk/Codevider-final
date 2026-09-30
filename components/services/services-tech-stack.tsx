"use client";

import {
	AnimatePresence,
	motion,
	useInView,
	useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionHead from "@/components/index/section-head";
import {
	getTechStackCategory,
	getTechStackInitials,
	TECH_STACK_CATEGORIES,
	type TechStackCategoryId,
	type TechStackItem,
} from "@/data/tech-stack";
import { useRevealInView } from "@/hooks/use-page-end";
import { useCopy } from "@/lib/copy";

type CategoryId = TechStackCategoryId;

const CYCLE_MS = 10000;

const springOpen = { type: "spring" as const, duration: 0.4, bounce: 0 };
const instantTransition = { duration: 0 };
const revealEase = [0.22, 1, 0.36, 1] as const;

/** Brand-duotone technology icons (light + .dark variants). */
function getDuotoneIconSrc(
	categoryId: CategoryId,
	icon: string,
	theme: "light" | "dark",
) {
	const name = icon.replace(/\.svg$/i, "");
	return `/icons/technologies/${categoryId}/${name}${theme === "dark" ? ".dark" : ""}.svg`;
}

function TechTile({
	item,
	index,
	sectionIndex,
	shouldReduceMotion,
	categoryId,
}: {
	item: TechStackItem;
	index: number;
	sectionIndex: number;
	shouldReduceMotion: boolean | null;
	categoryId: CategoryId;
}) {
	const transition = shouldReduceMotion
		? instantTransition
		: { ...springOpen, delay: sectionIndex * 0.08 + index * 0.05 + 0.04 };

	const iconHeight = item.iconDimensions?.height ?? 30;
	const iconMaxWidth = item.iconDimensions?.maxWidth ?? 34;
	const icon = item.icon;
	const isWideIcon = iconMaxWidth > 34;

	return (
		<motion.div
			className="svc-tech-tile"
			initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={transition}
		>
			{icon ? (
				<span
					className={
						isWideIcon
							? "svc-tech-tile__icon svc-tech-tile__icon--wide"
							: "svc-tech-tile__icon"
					}
					aria-hidden
				>
					<span
						className="svc-tech-tile__icon-slot"
						style={{ width: iconMaxWidth, height: iconHeight }}
					>
						{(["light", "dark"] as const).map((theme) => (
							<img
								key={theme}
								src={getDuotoneIconSrc(categoryId, icon, theme)}
								alt=""
								width={iconMaxWidth}
								height={iconHeight}
								className={`svc-tech-tile__icon-img svc-tech-tile__icon-img--${theme}`}
								style={{ height: iconHeight, maxWidth: iconMaxWidth }}
								loading="lazy"
								decoding="async"
							/>
						))}
					</span>
				</span>
			) : (
				<span className="svc-tech-tile__badge" aria-hidden>
					{getTechStackInitials(item.name)}
				</span>
			)}
			<span className="svc-tech-tile__label">{item.name}</span>
		</motion.div>
	);
}

function TechCategorySection({
	categoryId,
	sectionIndex,
	shouldReduceMotion,
}: {
	categoryId: CategoryId;
	sectionIndex: number;
	shouldReduceMotion: boolean | null;
}) {
	const t = useCopy("services.tech");
	const section = getTechStackCategory(categoryId);
	const titleId = `tech-section-${categoryId}`;

	if (!section) return null;

	const sectionTransition = shouldReduceMotion
		? instantTransition
		: { duration: 0.5, ease: revealEase, delay: sectionIndex * 0.08 };

	return (
		<motion.section
			className="svc-tech-group"
			aria-labelledby={titleId}
			initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={sectionTransition}
		>
			<h3 id={titleId} className="svc-tech-group__title">
				{t(`categories.${categoryId}.label`)}
			</h3>

			<div className="svc-tech-grid">
				{section.items.map((item, index) => (
					<TechTile
						key={item.name}
						item={item}
						index={index}
						categoryId={categoryId}
						sectionIndex={sectionIndex}
						shouldReduceMotion={shouldReduceMotion}
					/>
				))}
			</div>
		</motion.section>
	);
}

export default function ServicesTechStack() {
	const t = useCopy("services.tech");
	const ref = useRef<HTMLElement>(null);
	const inView = useRevealInView(ref, { once: true, margin: "-10% 0px" });
	const isVisible = useInView(ref, { margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();
	const [activeIndex, setActiveIndex] = useState(0);
	const [cycleKey, setCycleKey] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const activeCategory = TECH_STACK_CATEGORIES[activeIndex];

	const canAnimate = inView || shouldReduceMotion;

	const startCycle = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = setInterval(() => {
			setActiveIndex((i) => (i + 1) % TECH_STACK_CATEGORIES.length);
			setCycleKey((k) => k + 1);
		}, CYCLE_MS);
	}, []);

	const stopCycle = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = null;
	}, []);

	// Only run the countdown while the section is on screen; restart it fresh on re-entry.
	useEffect(() => {
		if (!isVisible) return;
		setCycleKey((k) => k + 1);
		startCycle();
		return stopCycle;
	}, [isVisible, startCycle, stopCycle]);

	const goTo = useCallback(
		(idx: number) => {
			setActiveIndex(idx);
			setCycleKey((k) => k + 1);
			if (isVisible) startCycle();
		},
		[isVisible, startCycle],
	);

	const filters = useMemo(
		() =>
			TECH_STACK_CATEGORIES.map((id) => ({
				id,
				label: t(`categories.${id}.label`),
			})),
		[t],
	);

	return (
		<section
			ref={ref}
			id="tech-stack"
			className="home-section home-section--tight"
		>
			<div className="home-wrap">
				<SectionHead
					headline={t("headline")}
					description={t("description")}
					centered
				/>

				<div className="home-section-lead mx-auto max-w-[920px]">
					<div
						className="svc-tech-filters"
						role="tablist"
						aria-label={t("categories_aria")}
					>
						{filters.map((filter, i) => {
							const isActive = i === activeIndex;

							return (
								<button
									key={filter.id}
									type="button"
									role="tab"
									aria-selected={isActive}
									className={`svc-tech-filter relative cursor-pointer overflow-hidden ${isActive ? "svc-tech-filter--active" : ""}`}
									onClick={() => goTo(i)}
								>
									{filter.label}
									{isActive && isVisible && (
										<motion.span
											key={cycleKey}
											className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-current opacity-40"
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											transition={{
												duration: CYCLE_MS / 1000,
												ease: "linear",
											}}
										/>
									)}
								</button>
							);
						})}
					</div>

					<AnimatePresence mode="wait" initial={false}>
						{canAnimate ? (
							<motion.div
								key={activeCategory}
								role="tabpanel"
								aria-live="polite"
								className="svc-tech-groups"
								initial={shouldReduceMotion ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={
									shouldReduceMotion
										? undefined
										: {
												opacity: 0,
												transition: { duration: 0.12, ease: "easeIn" },
											}
								}
								transition={{ duration: 0.15 }}
							>
								<TechCategorySection
									key={activeCategory}
									categoryId={activeCategory}
									sectionIndex={0}
									shouldReduceMotion={shouldReduceMotion}
								/>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
