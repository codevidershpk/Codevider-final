"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useState } from "react";
import {
	appleRevealEase,
	sectionItemTransition,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import SectionHead from "./section-head";

const FAQ_IDS = [
	"projects",
	"technologies",
	"estimates",
	"ownership",
	"communication",
	"quality",
	"support",
	"legacy",
] as const;

const instantTransition = { duration: 0 };

type FaqId = (typeof FAQ_IDS)[number];

type FaqItemProps = {
	id: FaqId;
	index: number;
	isOpen: boolean;
	onToggle: () => void;
	question: string;
	answer: string;
	shouldReduceMotion: boolean | null;
	isRevealed: boolean;
	shouldAnimate: boolean;
};

function FaqItem({
	id,
	index,
	isOpen,
	onToggle,
	question,
	answer,
	shouldReduceMotion,
	isRevealed,
	shouldAnimate,
}: FaqItemProps) {
	const panelId = `faq-panel-${id}`;
	const triggerId = `faq-trigger-${id}`;

	return (
		<motion.div
			className="home-faq-item"
			data-open={isOpen}
			initial={
				shouldReduceMotion || !shouldAnimate ? false : sectionRevealItem.hidden
			}
			animate={
				isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden
			}
			transition={sectionItemTransition(
				shouldAnimate,
				index * 0.06,
				!!shouldReduceMotion,
			)}
		>
			<motion.button
				type="button"
				id={triggerId}
				className="home-faq-q"
				aria-expanded={isOpen}
				aria-controls={panelId}
				onClick={onToggle}
				whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
			>
				<span className="min-w-0">{question}</span>
				<motion.span
					className="home-faq-icon"
					aria-hidden
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={
						shouldReduceMotion
							? instantTransition
							: { duration: 0.45, ease: appleRevealEase }
					}
				>
					<ChevronDown className="size-4 stroke-2" />
				</motion.span>
			</motion.button>

			<div
				id={panelId}
				role="region"
				aria-labelledby={triggerId}
				aria-hidden={!isOpen}
				className={`home-faq-panel${isOpen ? " home-faq-panel--open" : ""}${
					shouldReduceMotion ? " home-faq-panel--instant" : ""
				}`}
			>
				<div className="home-faq-panel__inner">
					<p className="home-faq-a max-w-[58ch] px-1 pb-8 pt-0.5 text-base leading-relaxed text-(--text) text-pretty">
						{answer}
					</p>
				</div>
			</div>
		</motion.div>
	);
}

export default function Faq() {
	const t = useCopy("home.faq");
	const { ref, isRevealed, shouldAnimate } = useSectionReveal();
	const shouldReduceMotion = useReducedMotion();
	const [openId, setOpenId] = useState<string | null>(null);

	return (
		<section ref={ref} className="home-section home-section--tight">
			<div className="home-wrap">
				<SectionHead eyebrow={t("eyebrow")} headline={t("headline")} centered />

				<div className="home-section-lead mx-auto max-w-[860px]">
					{FAQ_IDS.map((id, index) => {
						const isOpen = openId === id;

						return (
							<FaqItem
								key={id}
								id={id}
								index={index}
								isOpen={isOpen}
								onToggle={() => setOpenId(isOpen ? null : id)}
								question={t(`items.${id}.question`)}
								answer={t(`items.${id}.answer`)}
								shouldReduceMotion={shouldReduceMotion}
								isRevealed={isRevealed}
								shouldAnimate={shouldAnimate}
							/>
						);
					})}
				</div>
			</div>
		</section>
	);
}
