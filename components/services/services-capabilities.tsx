"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const SERVICE_IDS = [
	"custom",
	"web",
	"ai",
	"automation",
	"systems",
	"cloud",
	"team",
] as const;

type ServiceId = (typeof SERVICE_IDS)[number];

/** DOM id for a service block, e.g. `services-3` (also the URL hash). */
function serviceDomId(id: ServiceId) {
	return `services-${SERVICE_IDS.indexOf(id) + 1}`;
}

const revealEase = [0.22, 1, 0.36, 1] as const;

function ServiceList({
	items,
	variant,
}: {
	items: string[];
	variant: "solutions" | "outcomes";
}) {
	return (
		<ul className="svc-list">
			{items.map((item) => (
				<li key={item} className="svc-list__item">
					<span
						className={
							variant === "solutions" ? "home-check" : "svc-list__arrow"
						}
					>
						{variant === "solutions" ? (
							<Check className="size-3.5" strokeWidth={3} aria-hidden />
						) : (
							<ArrowRight className="size-3.5" strokeWidth={2.5} aria-hidden />
						)}
					</span>
					{item}
				</li>
			))}
		</ul>
	);
}

function ServiceBlock({
	id,
	index,
	solutionsHeading,
	outcomesHeading,
}: {
	id: ServiceId;
	index: number;
	solutionsHeading: string;
	outcomesHeading: string;
}) {
	const t = useCopy(`services.capabilities.items.${id}`);
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-12% 0px" });
	const shouldReduceMotion = useReducedMotion();

	const solutions = [t("solutions.1"), t("solutions.2"), t("solutions.3")];
	const outcomes = [t("outcomes.1"), t("outcomes.2"), t("outcomes.3")];

	const transition = shouldReduceMotion
		? { duration: 0 }
		: { duration: 0.55, ease: revealEase, delay: index * 0.04 };

	return (
		<motion.article
			ref={ref}
			id={serviceDomId(id)}
			data-service={id}
			className="svc-block"
			initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
			animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
			transition={transition}
		>
			<div className="svc-block__num">{t("num")}</div>
			<h2 className="svc-block__title">{t("title")}</h2>
			<p className="svc-block__desc">{t("description")}</p>

			<div className="svc-cols">
				<div>
					<h3 className="svc-cols__heading">{solutionsHeading}</h3>
					<ServiceList items={solutions} variant="solutions" />
				</div>
				<div>
					<h3 className="svc-cols__heading">{outcomesHeading}</h3>
					<ServiceList items={outcomes} variant="outcomes" />
				</div>
			</div>

			{id === "team" ? <ServiceCta /> : null}
		</motion.article>
	);
}

function ServiceCta() {
	const t = useCopy("services.capabilities");

	return (
		<div className="svc-cta">
			<p>
				<strong>{t("cta_title")}</strong> {t("cta_body")}
			</p>
			<Link
				href={{ pathname: "/", hash: "contact" }}
				scroll={false}
				className="svc-cta__btn"
			>
				{t("cta_button")}
				<ArrowRight className="size-4" aria-hidden />
			</Link>
		</div>
	);
}

export default function ServicesCapabilities() {
	const t = useCopy("services.capabilities");
	const tItems = useCopy("services.capabilities.items");
	const [activeId, setActiveId] = useState<ServiceId>(SERVICE_IDS[0]);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const handleNavClick = useCallback((id: ServiceId) => {
		const el = document.getElementById(serviceDomId(id));
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, []);

	useEffect(() => {
		observerRef.current?.disconnect();

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				const service = (visible[0]?.target as HTMLElement | undefined)?.dataset
					.service as ServiceId | undefined;
				if (service) {
					setActiveId(service);
				}
			},
			{ rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
		);

		SERVICE_IDS.forEach((id) => {
			const el = document.getElementById(serviceDomId(id));
			if (el) observerRef.current?.observe(el);
		});

		return () => observerRef.current?.disconnect();
	}, []);

	return (
		<section className="home-section home-section--tight">
			<div className="home-wrap">
				<div className="svc-layout">
					<aside className="svc-index" aria-label={t("nav_aria")}>
						{SERVICE_IDS.map((id) => {
							const isActive = activeId === id;

							return (
								<a
									key={id}
									href={`#${serviceDomId(id)}`}
									aria-current={isActive ? "true" : undefined}
									className={`svc-index__link ${isActive ? "svc-index__link--active" : ""}`}
									onClick={(event) => {
										event.preventDefault();
										handleNavClick(id);
									}}
								>
									<span className="svc-index__num">{tItems(`${id}.num`)}</span>
									{t(`nav.${id}`)}
								</a>
							);
						})}
					</aside>

					<div className="svc-blocks">
						{SERVICE_IDS.map((id, index) => (
							<ServiceBlock
								key={id}
								id={id}
								index={index}
								solutionsHeading={t("solutions_heading")}
								outcomesHeading={t("outcomes_heading")}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
