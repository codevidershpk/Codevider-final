"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import LegalContentBlocks from "@/components/legal/legal-content-blocks";
import { useRevealInView } from "@/hooks/use-page-end";
import { useCopy } from "@/lib/copy";
import { isLegalBlockArray } from "@/lib/legal-content";

const revealEase = [0.22, 1, 0.36, 1] as const;
const STAGGER_MS = 0.1;

type LegalDocumentProps = {
	namespace: "legal.terms" | "legal.privacy";
	sections: readonly string[];
};

export default function LegalDocument({
	namespace,
	sections,
}: LegalDocumentProps) {
	const t = useCopy(namespace);
	const tShared = useCopy("legal.shared");
	const ref = useRef<HTMLElement>(null);
	const inView = useRevealInView(ref, { once: true, margin: "-8% 0px" });
	const shouldReduceMotion = useReducedMotion();
	const [activeSection, setActiveSection] = useState<string>(sections[0]);

	useEffect(() => {
		const observers: IntersectionObserver[] = [];
		const visible = new Map<string, number>();

		sections.forEach((section) => {
			const el = document.getElementById(section);
			if (!el) return;
			const obs = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						visible.set(section, entry.intersectionRatio);
					} else {
						visible.delete(section);
					}
					if (visible.size > 0) {
						const top = [...visible.entries()].reduce((a, b) =>
							a[1] >= b[1] ? a : b,
						)[0];
						setActiveSection(top);
					}
				},
				{ rootMargin: "-10% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
			);
			obs.observe(el);
			observers.push(obs);
		});

		return () => observers.forEach((o) => o.disconnect());
	}, [sections]);

	return (
		<section ref={ref} className="legal-doc">
			<div className="home-wrap">
				<div className="legal-doc__layout">
					<nav className="legal-doc__toc" aria-label={tShared("toc_label")}>
						<p className="legal-doc__toc-heading">{tShared("toc_heading")}</p>
						<ol>
							{sections.map((section, index) => (
								<li key={section}>
									<a
										href={`#${section}`}
										className={`legal-doc__toc-link${activeSection === section ? " legal-doc__toc-link--active" : ""}`}
									>
										<span className="legal-doc__toc-num" aria-hidden>
											{String(index + 1).padStart(2, "0")}
										</span>
										<span className="legal-doc__toc-text">
											{t(`sections.${section}.title`)}
										</span>
									</a>
								</li>
							))}
						</ol>
					</nav>

					<div className="legal-doc__content">
						{sections.map((section, index) => {
							const blocks = t.raw(`sections.${section}.blocks`);
							const transition = shouldReduceMotion
								? { duration: 0 }
								: {
										duration: 0.5,
										ease: revealEase,
										delay: index * STAGGER_MS,
									};

							return (
								<motion.article
									key={section}
									id={section}
									className="legal-doc__section"
									initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
									animate={
										inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
									}
									transition={transition}
								>
									<header className="legal-doc__section-head">
										<span className="legal-doc__section-num" aria-hidden>
											{String(index + 1).padStart(2, "0")}
										</span>
										<h2 className="legal-doc__title">
											{t(`sections.${section}.title`)}
										</h2>
									</header>
									{isLegalBlockArray(blocks) ? (
										<LegalContentBlocks blocks={blocks} />
									) : null}
								</motion.article>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
