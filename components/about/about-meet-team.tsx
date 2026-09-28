"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCopy } from "@/lib/copy";
import { useEffect, useRef, useState } from "react";
import SectionHead from "@/components/index/section-head";
import { teamMembers } from "@/data/team-members";

const revealEase = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
	hidden: { opacity: 0, y: 28 },
	visible: (index: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: revealEase,
			delay: index * 0.06,
		},
	}),
};

function getCardStep(el: HTMLDivElement): number {
	const first = el.children[0] as HTMLElement | undefined;
	const second = el.children[1] as HTMLElement | undefined;

	if (!first) return el.clientWidth;
	if (!second) return first.offsetWidth;

	return second.offsetLeft - first.offsetLeft;
}

function getPageSize(el: HTMLDivElement): number {
	const cardStep = getCardStep(el);
	if (cardStep <= 0) return 1;

	return Math.max(1, Math.round(el.clientWidth / cardStep));
}

// Enough copies that a hard fling can't reach either real edge before the
// scroll settles and we silently re-center.
const LOOP_COPIES = 9;
const MIDDLE_COPY = Math.floor(LOOP_COPIES / 2);

function getSetWidth(el: HTMLDivElement): number {
	return getCardStep(el) * teamMembers.length;
}

// Move the scroll position back into the middle copy, preserving the offset
// within the set, so both directions always have content ahead.
function normalizeLoop(el: HTMLDivElement): void {
	const setWidth = getSetWidth(el);
	if (setWidth <= 0) return;

	const middleStart = setWidth * MIDDLE_COPY;
	const offset =
		(((el.scrollLeft - middleStart) % setWidth) + setWidth) % setWidth;
	const target = middleStart + offset;

	if (Math.abs(target - el.scrollLeft) > 1) {
		el.scrollTo({ left: target, behavior: "instant" });
	}
}

function scrollByPage(el: HTMLDivElement, direction: "left" | "right"): void {
	const pageSize = getPageSize(el);
	const scrollAmount = pageSize * getCardStep(el);

	el.scrollBy({
		left: direction === "right" ? scrollAmount : -scrollAmount,
		behavior: "smooth",
	});
}

export default function AboutMeetTeam() {
	const t = useCopy("about.team");
	const sectionRef = useRef<HTMLElement>(null);
	const carouselRef = useRef<HTMLDivElement>(null);
	const [photoCenterY, setPhotoCenterY] = useState<number | null>(null);
	const inView = useInView(sectionRef, { once: true, margin: "-8% 0px" });
	const shouldReduceMotion = useReducedMotion();

	useEffect(() => {
		const root = carouselRef.current;
		if (!root) return;

		const photo = root.querySelector<HTMLElement>(
			".about-team-carousel__photo",
		);
		if (!photo) return;

		const update = () => {
			setPhotoCenterY(photo.offsetHeight / 2);
		};

		update();
		const observer = new ResizeObserver(update);
		observer.observe(photo);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const el = carouselRef.current;
		if (!el) return;

		el.scrollTo({
			left: getSetWidth(el) * MIDDLE_COPY,
			behavior: "instant",
		});

		let timer: ReturnType<typeof setTimeout> | undefined;
		const onScrollEnd = () => normalizeLoop(el);
		const onScroll = () => {
			clearTimeout(timer);
			timer = setTimeout(onScrollEnd, 150);
		};
		const supportsScrollEnd = "onscrollend" in window;

		el.addEventListener(
			supportsScrollEnd ? "scrollend" : "scroll",
			supportsScrollEnd ? onScrollEnd : onScroll,
		);
		return () => {
			clearTimeout(timer);
			el.removeEventListener("scrollend", onScrollEnd);
			el.removeEventListener("scroll", onScroll);
		};
	}, []);

	const scroll = (direction: "left" | "right") => {
		const el = carouselRef.current;
		if (!el) return;
		scrollByPage(el, direction);
	};

	const scrollToCard = (index: number) => {
		const el = carouselRef.current;
		if (!el) return;

		const card = el.children[index] as HTMLElement | undefined;
		if (!card) return;

		const containerRect = el.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();
		const scrollLeft =
			el.scrollLeft +
			(cardRect.left - containerRect.left) -
			(containerRect.width - cardRect.width) / 2;

		el.scrollTo({ left: scrollLeft, behavior: "smooth" });
	};

	return (
		<section
			id="team"
			ref={sectionRef}
			className="home-section home-section--tight home-feature-alt overflow-hidden"
		>
			<div className="home-wrap">
				<SectionHead
					eyebrow={t("eyebrow")}
					headline={t("headline")}
					description={t("description")}
					centered
				/>
			</div>

			<div className="home-wrap relative mt-(--home-stack)">
				<div
					className="pointer-events-none absolute left-0 right-0 z-20 flex -translate-y-1/2 items-center justify-between home-inline-x"
					style={{ top: photoCenterY ?? "35%" }}
				>
					<button
						type="button"
						onClick={() => scroll("left")}
						aria-label={t("scroll_left")}
						className="about-team-carousel__nav pointer-events-auto"
					>
						<ChevronLeft className="size-4" aria-hidden />
					</button>
					<button
						type="button"
						onClick={() => scroll("right")}
						aria-label={t("scroll_right")}
						className="about-team-carousel__nav pointer-events-auto"
					>
						<ChevronRight className="size-4" aria-hidden />
					</button>
				</div>

				<div
					ref={carouselRef}
					className="about-team-carousel flex gap-4 overflow-x-auto pb-4 md:gap-6 scrollbar-none [&::-webkit-scrollbar]:hidden"
				>
					{Array.from({ length: LOOP_COPIES }, (_, copy) =>
						teamMembers.map((member, memberIndex) => {
							const index = copy * teamMembers.length + memberIndex;
							const isClone = copy !== MIDDLE_COPY;
							return (
								<motion.div
									key={`${copy}-${member.name}`}
									aria-hidden={isClone || undefined}
									custom={memberIndex}
									initial={shouldReduceMotion ? false : "hidden"}
									animate={inView ? "visible" : "hidden"}
									variants={cardVariants}
									className="about-team-carousel__card shrink-0"
								>
									<button
										type="button"
										onClick={() => scrollToCard(index)}
										tabIndex={isClone ? -1 : undefined}
										className="group block w-full text-left"
									>
										<div className="about-team-carousel__photo overflow-hidden">
											<Image
												src={member.image}
												alt={member.name}
												fill
												sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 22vw"
												priority={!isClone && memberIndex < 4}
												className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
											/>
										</div>
										<div className="mt-4 text-center">
											<h3 className="text-[17px] font-semibold text-(--text-h)">
												{member.name}
											</h3>
											<p className="mt-0.5 text-sm text-(--text)">
												{member.role}
											</p>
										</div>
									</button>
								</motion.div>
							);
						}),
					)}
				</div>
			</div>
		</section>
	);
}
