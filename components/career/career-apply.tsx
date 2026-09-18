"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useCopy, type CopyTranslator } from "@/lib/copy";
import { useCallback, useEffect, useMemo, useState } from "react";
import CareerApplyForm from "@/components/career/career-apply-form";
import Link from "next/link";
import { fetchJobById } from "@/lib/api/recruit-jobs";
import type { JobDetail } from "@/lib/types/recruit";

const revealEase = [0.22, 1, 0.36, 1] as const;

type LoadState =
	| { status: "loading" }
	| { status: "error" }
	| { status: "ready"; job: JobDetail };

type DetailRow = {
	key: string;
	label: string;
	value: string;
};

function formatPayPeriod(t: CopyTranslator, period: string) {
	const key = `pay_period_${period}` as const;
	return t.has(key) ? t(key) : period;
}

function formatPayType(t: CopyTranslator, payType: string) {
	const normalized = payType.trim().toLowerCase().replace(/\s+/g, "_");
	const key = `pay_type_${normalized}` as const;
	return t.has(key) ? t(key) : payType;
}

/** CRM descriptions may include pasted HTML; show readable plain text. */
function toPlainDescription(value: string): string {
	return value
		.replace(/<\s*br\s*\/?\s*>/gi, "\n")
		.replace(/<\/\s*p\s*>/gi, "\n")
		.replace(/<\s*p(?:\s[^>]*)?>/gi, "")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

export default function CareerApply() {
	const t = useCopy("career.apply");
	const metadataT = useCopy("metadata.career_apply");
	const searchParams = useSearchParams();
	const rawId = searchParams.get("id");
	const jobId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null;
	const shouldReduceMotion = useReducedMotion();
	const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

	const loadJob = useCallback(async (id: number) => {
		setLoadState({ status: "loading" });

		try {
			const job = await fetchJobById(id);
			setLoadState({ status: "ready", job });
		} catch {
			setLoadState({ status: "error" });
		}
	}, []);

	useEffect(() => {
		if (!jobId) {
			setLoadState({ status: "error" });
			return;
		}

		void loadJob(jobId);
	}, [jobId, loadJob]);

	useEffect(() => {
		if (loadState.status !== "ready") return;

		const nextTitle = metadataT("title_with_role", {
			title: loadState.job.title,
		});
		const previousTitle = document.title;
		document.title = nextTitle;

		return () => {
			document.title = previousTitle;
		};
	}, [loadState, metadataT]);

	const reveal = (delay: number) => ({
		initial: shouldReduceMotion ? false : { opacity: 0, y: 14 },
		animate: { opacity: 1, y: 0 },
		transition: shouldReduceMotion
			? { duration: 0 }
			: { duration: 0.45, ease: revealEase, delay },
	});

	const job = loadState.status === "ready" ? loadState.job : null;

	const formatDate = useCallback(
		(value: string) =>
			new Intl.DateTimeFormat("en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}).format(new Date(value)),
		[],
	);

	const detailRows = useMemo<DetailRow[]>(() => {
		if (!job) return [];

		const rows: DetailRow[] = [];

		if (job.job_type?.job_type) {
			rows.push({
				key: "job_type",
				label: t("job_type"),
				value: job.job_type.job_type,
			});
		}

		if (job.department?.name) {
			rows.push({
				key: "department",
				label: t("department"),
				value: job.department.name,
			});
		}

		rows.push({
			key: "total_positions",
			label: t("total_positions"),
			value: String(job.total_positions),
		});

		rows.push({
			key: "openings",
			label: t("openings"),
			value: t("openings_count", { count: job.remaining_openings }),
		});

		rows.push({
			key: "pay_type",
			label: t("pay_type"),
			value: formatPayType(t, job.pay_type),
		});

		if (job.start_amount !== null) {
			const period = formatPayPeriod(t, job.pay_according_to);
			rows.push({
				key: "compensation",
				label: t("compensation"),
				value:
					job.end_amount !== null
						? t("compensation_range", {
								start: job.start_amount,
								end: job.end_amount,
								period,
							})
						: t("compensation_single", {
								amount: job.start_amount,
								period,
							}),
			});
		}

		if (job.start_date && job.end_date) {
			rows.push({
				key: "application_period",
				label: t("application_period"),
				value: t("application_period_range", {
					start: formatDate(job.start_date),
					end: formatDate(job.end_date),
				}),
			});
		}

		return rows;
	}, [formatDate, job, t]);

	return (
		<section className="career-apply-page">
			<div className="home-wrap career-apply-page__inner">
				<motion.div {...reveal(0)}>
					<Link href="/career#openings" className="career-apply-page__back">
						<ArrowLeft className="size-4" aria-hidden />
						{t("back")}
					</Link>
				</motion.div>

				<motion.header className="career-apply-page__header" {...reveal(0.06)}>
					<p className="home-eyebrow">{t("eyebrow")}</p>
					<h1 className="career-apply-page__title">
						{job ? job.title : t("loading_title")}
					</h1>
					{job?.job_description ? (
						<p className="career-apply-page__description whitespace-pre-wrap">
							{toPlainDescription(job.job_description)}
						</p>
					) : null}
					{job && !job.job_description ? (
						<p className="career-apply-page__subtitle career-apply-page__subtitle--empty">
							{t("no_description")}
						</p>
					) : null}
				</motion.header>

				<div className="career-apply-page__body">
					{loadState.status === "loading" ? (
						<div className="career-apply-page__loading" aria-live="polite">
							<Loader2 className="size-5 animate-spin" aria-hidden />
							<span>{t("loading")}</span>
						</div>
					) : null}

					{loadState.status === "error" ? (
						<div className="career-apply-page__error" role="alert">
							<p>{t("error")}</p>
							<button
								type="button"
								className="svc-cta__btn"
								onClick={() => {
									if (jobId) void loadJob(jobId);
								}}
							>
								{t("retry")}
							</button>
						</div>
					) : null}

					{job ? (
						<motion.div
							className="career-apply-page__content"
							{...reveal(0.12)}
						>
							<section
								className="career-apply-page__section"
								aria-labelledby="career-apply-details"
							>
								<h2
									id="career-apply-details"
									className="career-apply-page__section-title"
								>
									{t("details_heading")}
								</h2>
								<dl className="career-apply-page__meta">
									{detailRows.map((row) => (
										<div key={row.key}>
											<dt>{row.label}</dt>
											<dd>{row.value}</dd>
										</div>
									))}
								</dl>
							</section>
						</motion.div>
					) : null}
				</div>

				{job ? (
					<motion.section
						className="career-apply-page__form"
						aria-labelledby="career-apply-form"
						{...reveal(0.18)}
					>
						<h2
							id="career-apply-form"
							className="career-apply-page__form-title"
						>
							{t("apply_button")}
						</h2>
						<CareerApplyForm job={job} />
					</motion.section>
				) : null}
			</div>
		</section>
	);
}
