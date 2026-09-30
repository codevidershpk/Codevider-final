"use client";

import {
	ArrowRight,
	ArrowUpRight,
	Briefcase,
	Building2,
	ChevronLeft,
	ChevronRight,
	Clock3,
	Loader2,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOpenJobs } from "@/lib/api/recruit-jobs";
import { useCopy } from "@/lib/copy";
import type { OpenJob, PaginatedMeta } from "@/lib/types/recruit";

const revealEase = [0.22, 1, 0.36, 1] as const;
const JOBS_PAGE_SIZE = 5;

const initialMeta: PaginatedMeta = {
	page: 1,
	limit: JOBS_PAGE_SIZE,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPreviousPage: false,
};

export default function CareerOpenings() {
	const t = useCopy("career.openings");
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-10% 0px" });
	const shouldReduceMotion = useReducedMotion();
	const [jobs, setJobs] = useState<OpenJob[]>([]);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);
	const [meta, setMeta] = useState<PaginatedMeta>(initialMeta);
	const [isPageLoading, setIsPageLoading] = useState(false);
	const [attempt, setAttempt] = useState(0);

	const emailHref = `mailto:info@codevider.com?subject=${encodeURIComponent(t("email_subject"))}`;

	const loadJobsPage = useCallback(async (nextPage: number) => {
		const response = await fetchOpenJobs({
			page: nextPage,
			limit: JOBS_PAGE_SIZE,
		});
		setJobs(response.data);
		setMeta(response.meta);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` re-runs the fetch on retry
	useEffect(() => {
		let cancelled = false;

		async function loadInitialJobs() {
			try {
				const response = await fetchOpenJobs({
					page: 1,
					limit: JOBS_PAGE_SIZE,
				});
				if (!cancelled) {
					setJobs(response.data);
					setMeta(response.meta);
					setStatus("ready");
				}
			} catch {
				if (!cancelled) {
					setStatus("error");
				}
			}
		}

		void loadInitialJobs();

		return () => {
			cancelled = true;
		};
	}, [attempt]);

	const retry = useCallback(() => {
		setStatus("loading");
		setAttempt((n) => n + 1);
	}, []);

	const goToPage = useCallback(
		async (nextPage: number) => {
			if (
				isPageLoading ||
				nextPage < 1 ||
				nextPage > meta.totalPages ||
				nextPage === meta.page
			) {
				return;
			}

			setIsPageLoading(true);

			try {
				await loadJobsPage(nextPage);
				ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			} catch {
				// Keep the current page visible if pagination fails.
			} finally {
				setIsPageLoading(false);
			}
		},
		[isPageLoading, loadJobsPage, meta.page, meta.totalPages],
	);

	const hasJobs = status === "ready" && jobs.length > 0;
	const showPagination = hasJobs && meta.totalPages > 1;
	const showEmptyState =
		status === "ready" && jobs.length === 0 ? true : status === "error";

	const headReveal = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 14 },
		animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
		transition: shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.45, ease: revealEase, delay },
	});

	const outreachReveal = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 12 },
		animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
		transition: shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.45, ease: revealEase, delay },
	});

	return (
		<section ref={ref} className="home-section" id="openings">
			<div className="home-wrap career-openings__stack">
				{status === "loading" || hasJobs ? (
					<div className="career-openings-card">
						<div className="career-openings__head">
							<motion.h2
								className="text-balance text-[clamp(1.75rem,4.6vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-(--text-h)"
								{...headReveal(0)}
							>
								{t("headline_active")}
							</motion.h2>
							<motion.p className="career-openings__lead" {...headReveal(0.08)}>
								{status === "loading" ? t("loading") : t("description_active")}
							</motion.p>
						</div>

						{hasJobs ? (
							<div
								className="career-jobs__panel"
								aria-busy={isPageLoading}
								aria-live="polite"
							>
								<ul className="career-jobs">
									{jobs.map((job, index) => {
										const transition = shouldReduceMotion
											? { duration: 0 }
											: {
													duration: 0.45,
													ease: revealEase,
													delay: 0.22 + index * 0.08,
												};

										return (
											<motion.li
												key={job.id}
												initial={
													shouldReduceMotion ? false : { opacity: 0, y: 14 }
												}
												animate={
													inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
												}
												transition={transition}
											>
												<article className="career-job-card">
													<div className="career-job-card__main">
														<h3 className="career-job-card__title">
															{job.title}
														</h3>
														<ul
															className="career-job-card__meta"
															aria-label={t("meta_label")}
														>
															{job.department?.name ? (
																<li>
																	<Building2 className="size-4" aria-hidden />
																	<span>{job.department.name}</span>
																</li>
															) : null}
															<li>
																<Clock3 className="size-4" aria-hidden />
																<span>{job.job_type.job_type}</span>
															</li>
															<li>
																<Briefcase className="size-4" aria-hidden />
																<span className="tabular-nums">
																	{t("openings_count", {
																		count: job.remaining_openings,
																	})}
																</span>
															</li>
														</ul>
													</div>
													<Link
														href={`/career/apply?id=${job.id}`}
														className="career-job-card__cta"
														aria-label={t("apply_for", { title: job.title })}
													>
														<span className="career-job-card__cta-label">
															{t("view_details")}
														</span>
														<ArrowUpRight className="size-4" aria-hidden />
													</Link>
												</article>
											</motion.li>
										);
									})}
								</ul>

								{isPageLoading ? (
									<div className="career-jobs__loading" aria-hidden>
										<Loader2 className="size-5 animate-spin" />
									</div>
								) : null}
							</div>
						) : null}

						{showPagination ? (
							<nav
								className="career-jobs__pagination"
								aria-label={t("pagination_label")}
							>
								<button
									type="button"
									className="career-jobs__page-btn"
									onClick={() => void goToPage(meta.page - 1)}
									disabled={!meta.hasPreviousPage || isPageLoading}
									aria-label={t("previous_page")}
								>
									<ChevronLeft className="size-4" aria-hidden />
									<span>{t("previous")}</span>
								</button>

								<p className="career-jobs__page-status tabular-nums">
									{t("page_status", {
										current: meta.page,
										total: meta.totalPages,
									})}
								</p>

								<button
									type="button"
									className="career-jobs__page-btn"
									onClick={() => void goToPage(meta.page + 1)}
									disabled={!meta.hasNextPage || isPageLoading}
									aria-label={t("next_page")}
								>
									<span>{t("next")}</span>
									<ChevronRight className="size-4" aria-hidden />
								</button>
							</nav>
						) : null}

						{hasJobs ? (
							<div className="career-openings__outreach">
								<motion.h3
									className="text-balance text-[clamp(1.25rem,3vw,1.625rem)] leading-[1.15] tracking-[-0.015em] text-(--text-h)"
									{...outreachReveal(0.28 + jobs.length * 0.08)}
								>
									{t("outreach_headline")}
								</motion.h3>
								<motion.p
									className="career-openings__lead career-openings__lead--compact"
									{...outreachReveal(0.36 + jobs.length * 0.08)}
								>
									{t("description")}
								</motion.p>
								<motion.a
									href={emailHref}
									className="svc-cta__btn mt-[clamp(1.5rem,2.5vw,2rem)]"
									{...outreachReveal(0.44 + jobs.length * 0.08)}
								>
									{t("cta")}
									<ArrowRight className="size-4" aria-hidden />
								</motion.a>
							</div>
						) : null}
					</div>
				) : null}

				{showEmptyState && !hasJobs ? (
					<div className="career-empty">
						<motion.h2
							className="text-balance text-[clamp(1.75rem,4.6vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-(--text-h)"
							{...headReveal(0)}
						>
							{status === "error" ? t("error_headline") : t("headline")}
						</motion.h2>
						<motion.p className="career-openings__lead" {...headReveal(0.1)}>
							{status === "error" ? t("error") : t("description")}
						</motion.p>
						<motion.div className="career-empty__actions" {...headReveal(0.2)}>
							{status === "error" ? (
								<button type="button" onClick={retry} className="svc-cta__btn cursor-pointer">
									{t("retry")}
								</button>
							) : null}
							<a
								href={emailHref}
								className={
									status === "error" ? "career-empty__link cursor-pointer" : "svc-cta__btn cursor-pointer"
								}
							>
								{t("cta")}
								<ArrowRight className="size-4" aria-hidden />
							</a>
						</motion.div>
					</div>
				) : null}
			</div>
		</section>
	);
}
