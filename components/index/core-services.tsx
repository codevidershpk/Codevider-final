"use client";

import {
	ArrowUpRight,
	Bot,
	Check,
	Cloud,
	Code2,
	FlaskConical,
	Loader2,
	Package,
	Play,
	Rocket,
	Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useCopy } from "@/lib/copy";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

const SyntaxHighlighter = dynamic(
	() => import("@/components/ui/code-highlighter"),
	{ ssr: false },
);

import {
	ENGINEERING_DEMO_CODE,
	ENGINEERING_DEMO_TABS,
	type EngineeringDemoTab,
} from "@/data/engineering-demo-code";
import { darkCodeTheme } from "@/lib/code-theme";
import {
	appleRevealEase,
	sectionItemTransition,
	sectionRevealItem,
	sectionRevealStagger,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import Link from "next/link";
import SectionHead from "./section-head";

const ENGINEERING_CODE_LANGUAGES = {
	orders: "typescript",
	schema: "sql",
	deploy: "yaml",
} as const;

const reveal = sectionRevealItem;

/** Critically damped spring — Apple default for UI state changes. */
const APPLE_SPRING = { type: "spring" as const, duration: 0.35, bounce: 0 };
const APPLE_SPRING_FAST = { type: "spring" as const, duration: 0.3, bounce: 0 };

const listReveal = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08 },
	},
} as const;

function FeatureCheckList({ items }: { items: string[] }) {
	return (
		<motion.ul className="mt-6 grid gap-3" variants={listReveal}>
			{items.map((item) => (
				<motion.li
					key={item}
					variants={reveal}
					className="flex items-start gap-3 text-pretty text-sm leading-relaxed text-(--text)"
				>
					<span className="home-check home-check--sm mt-0.5">
						<Check className="size-2.5" strokeWidth={3} aria-hidden />
					</span>
					{item}
				</motion.li>
			))}
		</motion.ul>
	);
}

function AiDemo() {
	const t = useCopy("home.features.ai.demo");
	const chips = useRef([
		{ id: "tickets" as const, qKey: "chip_tickets_q", aKey: "chip_tickets_a" },
		{ id: "leads" as const, qKey: "chip_leads_q", aKey: "chip_leads_a" },
		{
			id: "schedule" as const,
			qKey: "chip_schedule_q",
			aKey: "chip_schedule_a",
		},
	]);
	const [active, setActive] =
		useState<(typeof chips.current)[number]["id"]>("tickets");
	const [answer, setAnswer] = useState("");
	const typeTimerRef = useRef<number | null>(null);
	const { ref, isRevealed } = useSectionReveal<HTMLDivElement>();
	const started = useRef(false);
	const shouldReduceMotion = useReducedMotion();

	const typeAnswer = useCallback(
		(text: string) => {
			if (typeTimerRef.current) {
				window.clearTimeout(typeTimerRef.current);
				typeTimerRef.current = null;
			}

			if (shouldReduceMotion) {
				setAnswer(text);
				return;
			}

			setAnswer("");
			let i = 0;
			const tick = () => {
				i += 1;
				setAnswer(text.slice(0, i));
				if (i < text.length) {
					typeTimerRef.current = window.setTimeout(tick, 16);
				}
			};
			tick();
		},
		[shouldReduceMotion],
	);

	const selectChip = useCallback(
		(chip: (typeof chips.current)[number]) => {
			setActive(chip.id);
			typeAnswer(t(chip.aKey));
		},
		[t, typeAnswer],
	);

	useEffect(() => {
		if (isRevealed && !started.current) {
			started.current = true;
			selectChip(chips.current[0]);
		}
	}, [isRevealed, selectChip]);

	useEffect(
		() => () => {
			if (typeTimerRef.current) {
				window.clearTimeout(typeTimerRef.current);
			}
		},
		[],
	);

	const activeChip =
		chips.current.find((c) => c.id === active) ?? chips.current[0];

	return (
		<div ref={ref} className="home-demo home-demo--ai">
			<div className="home-demo-head home-demo-head--wrap min-w-0 overflow-hidden">
				<div
					className="home-demo-chip-list w-full min-w-0 max-w-full flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
					role="group"
					aria-label={t("title")}
				>
					{chips.current.map((chip) => (
						<button
							key={chip.id}
							type="button"
							aria-pressed={active === chip.id}
							onClick={() => selectChip(chip)}
							className={`home-demo-chip cursor-pointer ${active === chip.id ? "home-demo-chip--active" : ""}`}
						>
							{t(`chip_${chip.id}_label`)}
						</button>
					))}
				</div>
			</div>
			<div className="home-demo-body home-demo-body--chat">
				<AnimatePresence mode="popLayout" initial={false}>
					<motion.div
						key={active}
						className="home-demo-chat-bubble home-demo-chat-bubble--user"
						initial={
							shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }
						}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={
							shouldReduceMotion
								? undefined
								: { opacity: 0, y: -6, scale: 0.98 }
						}
						transition={APPLE_SPRING}
					>
						{t(activeChip.qKey)}
					</motion.div>
				</AnimatePresence>
				<div
					className="home-demo-chat-bubble home-demo-chat-bubble--assistant"
					aria-live="polite"
					aria-atomic="true"
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={active}
							className="block"
							initial={shouldReduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={shouldReduceMotion ? undefined : { opacity: 0 }}
							transition={APPLE_SPRING_FAST}
						>
							{answer}
						</motion.span>
					</AnimatePresence>
				</div>
			</div>
			<div className="home-code-editor__status">
				<span className="grid size-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
					<Check className="size-3" strokeWidth={3} aria-hidden />
				</span>
				{t("status")}
			</div>
		</div>
	);
}

function CodeDemo() {
	const t = useCopy("home.features.engineering.demo");
	const tabs = Object.keys(ENGINEERING_DEMO_TABS) as EngineeringDemoTab[];
	const [active, setActive] = useState<EngineeringDemoTab>("orders");
	const shouldReduceMotion = useReducedMotion();
	const code = ENGINEERING_DEMO_CODE[active];

	return (
		<div className="home-demo home-code-editor">
			<div className="home-code-editor__chrome">
				<div className="home-code-editor__lights" aria-hidden>
					<span className="home-code-editor__light home-code-editor__light--close" />
					<span className="home-code-editor__light home-code-editor__light--minimize" />
					<span className="home-code-editor__light home-code-editor__light--maximize" />
				</div>
				<div
					className="home-code-editor__tabs"
					role="tablist"
					aria-label={t("tabs_aria")}
				>
					{tabs.map((tab) => (
						<button
							key={tab}
							type="button"
							role="tab"
							id={`engineering-tab-${tab}`}
							aria-controls={`engineering-panel-${tab}`}
							aria-selected={active === tab}
							tabIndex={active === tab ? 0 : -1}
							onClick={() => setActive(tab)}
							className={`home-code-editor__tab cursor-pointer ${active === tab ? "home-code-editor__tab--active" : ""}`}
						>
							{active === tab ? (
								shouldReduceMotion ? (
									<span className="home-code-editor__tab-indicator" />
								) : (
									<motion.span
										layoutId="engineering-tab-indicator"
										className="home-code-editor__tab-indicator"
										transition={APPLE_SPRING}
									/>
								)
							) : null}
							<span className="relative z-1">{ENGINEERING_DEMO_TABS[tab]}</span>
						</button>
					))}
				</div>
			</div>
			<div
				className="home-code-editor__viewport"
				role="tabpanel"
				id={`engineering-panel-${active}`}
				aria-labelledby={`engineering-tab-${active}`}
			>
				<SyntaxHighlighter
					language={ENGINEERING_CODE_LANGUAGES[active]}
					style={darkCodeTheme}
					wrapLongLines={false}
					customStyle={{
						margin: 0,
						padding: 0,
						background: "transparent",
					}}
				>
					{code.trimEnd()}
				</SyntaxHighlighter>
			</div>
			<div className="home-code-editor__status">
				<span className="grid size-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
					<Check className="size-3" strokeWidth={3} aria-hidden />
				</span>
				{t("status")}
			</div>
		</div>
	);
}

const POD_ROLES = ["frontend", "backend", "qa", "pm"] as const;

type PipelineStageState = "idle" | "active" | "done";

function PipelineStageIcon({
	state,
	StageIcon,
	shouldReduceMotion,
}: {
	state: PipelineStageState;
	StageIcon: typeof Package;
	shouldReduceMotion: boolean | null;
}) {
	return (
		<AnimatePresence mode="popLayout" initial={false}>
			<motion.span
				key={state}
				className="grid place-items-center"
				initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.25 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.25 }}
				transition={APPLE_SPRING_FAST}
			>
				{state === "done" ? (
					<Check className="size-5" strokeWidth={2.5} aria-hidden />
				) : state === "active" ? (
					<Loader2
						className="size-5 motion-reduce:animate-none animate-spin"
						aria-hidden
					/>
				) : (
					<StageIcon className="size-5" aria-hidden />
				)}
			</motion.span>
		</AnimatePresence>
	);
}

function PodDemo() {
	const t = useCopy("home.features.pod.demo");
	const [active, setActive] = useState<(typeof POD_ROLES)[number]>("frontend");
	const shouldReduceMotion = useReducedMotion();

	const positions: Record<(typeof POD_ROLES)[number], string> = {
		frontend: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
		backend: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
		qa: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
		pm: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
	};

	const avatars: Record<(typeof POD_ROLES)[number], string> = {
		frontend: "FE",
		backend: "BE",
		qa: "QA",
		pm: "PM",
	};

	const colors: Record<(typeof POD_ROLES)[number], string> = {
		frontend: "bg-(--pod-fe)",
		backend: "bg-(--pod-be)",
		qa: "bg-(--pod-qa)",
		pm: "bg-(--pod-pm)",
	};

	const titleColors: Record<(typeof POD_ROLES)[number], string> = {
		frontend: "text-(--pod-fe)",
		backend: "text-(--pod-be)",
		qa: "text-(--pod-qa)",
		pm: "text-(--pod-pm)",
	};

	const roleButtonClass = (role: (typeof POD_ROLES)[number]) =>
		`flex min-h-11 items-center gap-2 rounded-full border bg-(--bg) px-3.5 py-2 text-[13.5px] font-semibold shadow-sm transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--dash-brand) active:scale-[0.96] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 ${
			active === role
				? "scale-105 border-(--dash-brand) shadow-md"
				: "border-(--border) hover:scale-105 hover:border-(--dash-brand)"
		}`;

	const roleButtonProps = (role: (typeof POD_ROLES)[number]) => ({
		type: "button" as const,
		"aria-pressed": active === role,
		onMouseEnter: () => setActive(role),
		onFocus: () => setActive(role),
		onClick: () => setActive(role),
	});

	return (
		<div className="home-demo home-demo--pod">
			<div className="home-demo-head">
				<span className="flex items-center gap-2">{t("title")}</span>
				<span className="text-xs font-medium text-(--text)">
					{t("subtitle")}
				</span>
			</div>
			<div className="flex flex-col items-center gap-6 px-4 py-8 md:hidden">
				<div className="grid size-[104px] place-items-center rounded-full bg-(--dash-brand-solid) text-center text-sm font-semibold leading-tight whitespace-pre-line text-(--on-brand) shadow-[0_12px_30px_color-mix(in_srgb,var(--dash-brand-solid)_40%,transparent)]">
					{t("center")}
				</div>
				<div className="grid w-full max-w-[20rem] grid-cols-2 gap-2.5">
					{POD_ROLES.map((role) => (
						<button
							key={role}
							{...roleButtonProps(role)}
							className={roleButtonClass(role)}
						>
							<span
								className={`grid size-7 shrink-0 place-items-center rounded-full text-[11px] text-white ${colors[role]}`}
							>
								{avatars[role]}
							</span>
							<span className="truncate">{t(`role_${role}`)}</span>
						</button>
					))}
				</div>
			</div>
			<div className="relative hidden h-[360px] items-center justify-center px-4 md:flex">
				<div className="relative mx-auto size-[min(260px,100%)]">
					<span className="home-pod-ring absolute inset-0 rounded-full border-[1.5px] border-dashed border-(--border)" />
					<span className="home-pod-ring home-pod-ring--reverse absolute inset-[55px] rounded-full border-[1.5px] border-dashed border-(--border)" />
					<div className="absolute inset-0 grid place-items-center">
						<div className="relative z-2 grid size-[108px] place-items-center rounded-full bg-(--dash-brand-solid) text-center text-sm font-semibold leading-tight whitespace-pre-line text-(--on-brand) shadow-[0_12px_30px_color-mix(in_srgb,var(--dash-brand-solid)_40%,transparent)]">
							{t("center")}
						</div>
					</div>
					{POD_ROLES.map((role) => (
						<button
							key={role}
							{...roleButtonProps(role)}
							className={`absolute z-3 ${roleButtonClass(role)} ${positions[role]}`}
						>
							<span
								className={`grid size-7 place-items-center rounded-full text-[11px] text-white ${colors[role]}`}
							>
								{avatars[role]}
							</span>
							{t(`role_${role}`)}
						</button>
					))}
				</div>
			</div>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.p
					key={active}
					className="home-demo-body min-h-6 pt-0 text-center text-sm leading-relaxed text-(--text)"
					initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
					transition={APPLE_SPRING_FAST}
				>
					<span className={`font-semibold ${titleColors[active]}`}>
						{t(`role_${active}`)}
					</span>
					{" — "}
					{t(`role_${active}_desc`)}
				</motion.p>
			</AnimatePresence>
		</div>
	);
}

function PipelineDemo() {
	const t = useCopy("home.features.devops.demo");
	const stages = ["build", "test", "deploy"] as const;
	const stageIcons: Record<(typeof stages)[number], typeof Package> = {
		build: Package,
		test: FlaskConical,
		deploy: Rocket,
	};
	const [running, setRunning] = useState(false);
	const [doneCount, setDoneCount] = useState(0);
	const [activeStage, setActiveStage] = useState(-1);
	const [status, setStatus] = useState(t("idle"));
	const [live, setLive] = useState(false);
	const { ref, isRevealed } = useSectionReveal<HTMLDivElement>();
	const started = useRef(false);
	const shouldReduceMotion = useReducedMotion();

	const run = useCallback(() => {
		if (running) return;
		setRunning(true);
		setDoneCount(0);
		setActiveStage(0);
		setLive(false);

		if (shouldReduceMotion) {
			setDoneCount(stages.length);
			setActiveStage(-1);
			setLive(true);
			setRunning(false);
			return;
		}

		let step = 0;
		const next = () => {
			if (step > 0) {
				setDoneCount(step);
			}
			if (step < stages.length) {
				setActiveStage(step);
				setStatus(t(`status_${stages[step]}`));
				step += 1;
				window.setTimeout(next, 800);
			} else {
				setActiveStage(-1);
				setDoneCount(stages.length);
				setLive(true);
				setRunning(false);
			}
		};

		next();
	}, [running, shouldReduceMotion, t]);

	useEffect(() => {
		if (isRevealed && !started.current && !shouldReduceMotion) {
			started.current = true;
			run();
		}
	}, [isRevealed, run, shouldReduceMotion]);

	return (
		<div ref={ref} className="home-demo home-demo--pipeline">
			<div className="home-demo-head home-demo-head--pipeline">
				<div className="home-pipeline-head__row">
					<span className="flex items-center gap-2">
						<Cloud className="size-4 text-(--dash-brand)" aria-hidden />
						{t("title")}
					</span>
					{live ? (
						<motion.div
							className="home-live-badge"
							role="status"
							initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={APPLE_SPRING}
						>
							<span className="home-live-badge__dot" aria-hidden />
							<span>{t("status_live_label")}</span>
						</motion.div>
					) : (
						<span className="rounded-full bg-(--home-surface-muted) px-2.5 py-1 text-[11px] font-medium tracking-wide text-(--text) uppercase">
							{t("subtitle")}
						</span>
					)}
				</div>
				{live ? (
					<div className="home-pipeline-head__meta">
						<span className="rounded-full bg-(--home-surface-muted) px-2.5 py-1 text-[11px] font-medium tracking-wide text-(--text) uppercase">
							{t("subtitle")}
						</span>
					</div>
				) : null}
			</div>
			<div className="home-demo-body">
				<div className="home-pipeline-stages">
					<div className="home-pipeline-track">
						{stages.map((stage, i) => {
							const StageIcon = stageIcons[stage];

							return (
								<Fragment key={stage}>
									<div className="home-pipeline-track__cell">
										<motion.div
											className={`grid size-10 place-items-center rounded-xl ${
												doneCount > i
													? "bg-emerald-500/12 text-emerald-600 shadow-[0_1px_2px_rgba(16,185,129,0.12)]"
													: activeStage === i
														? "bg-(--dash-brand-bg) text-(--dash-brand) shadow-[0_1px_2px_color-mix(in_srgb,var(--dash-brand)_12%,transparent)]"
														: "bg-(--bg) text-(--text) shadow-[0_1px_2px_color-mix(in_srgb,var(--text-h)_6%,transparent)]"
											}`}
											layout={!shouldReduceMotion}
											transition={APPLE_SPRING_FAST}
										>
											<PipelineStageIcon
												state={
													doneCount > i
														? "done"
														: activeStage === i
															? "active"
															: "idle"
												}
												StageIcon={StageIcon}
												shouldReduceMotion={shouldReduceMotion}
											/>
										</motion.div>
									</div>
									{i < stages.length - 1 ? (
										<div
											className={`home-pipeline-track__connector ${
												doneCount > i
													? "home-pipeline-track__connector--done"
													: ""
											}`}
										/>
									) : null}
								</Fragment>
							);
						})}
						{stages.map((stage, i) => (
							<Fragment key={`label-${stage}`}>
								<span className="home-pipeline-track__label">
									{t(`stage_${stage}`)}
								</span>
								{i < stages.length - 1 ? (
									<span className="home-pipeline-track__gap" aria-hidden />
								) : null}
							</Fragment>
						))}
					</div>
				</div>
				<div className="home-pipeline-foot">
					<button
						type="button"
						onClick={run}
						disabled={running}
						className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-(--text-h) px-[18px] py-2.5 text-sm font-semibold text-(--bg) transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--dash-brand) disabled:cursor-default disabled:opacity-50 disabled:transform-none active:scale-[0.96] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 ${running ? "cursor-not-allowed" : "cursor-pointer"}`}
					>
						<Play className="size-4 fill-current" aria-hidden />
						{running
							? t("running")
							: doneCount === stages.length
								? t("run_again")
								: t("run")}
					</button>
				</div>
			</div>
		</div>
	);
}

type FeatureId = "ai" | "engineering" | "pod" | "devops";

type FeatureConfig = {
	id: FeatureId;
	icon: React.ReactNode;
	reverse?: boolean;
	demo: React.ReactNode;
	href: string;
};

function FeatureSection({
	feature,
	index,
}: {
	feature: FeatureConfig;
	index: number;
}) {
	const t = useCopy(`home.features.${feature.id}`);
	const { ref, isRevealed, shouldAnimate } = useSectionReveal();
	const shouldReduceMotion = useReducedMotion();

	const bullets = [t("bullet_1"), t("bullet_2"), t("bullet_3")];
	const headlineId = `${feature.id}-headline`;
	const textDelay = index * 0.04;

	return (
		<article
			ref={ref}
			aria-labelledby={headlineId}
			className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 [&_.home-demo]:w-full"
		>
			<motion.div
				className={`flex flex-col ${feature.reverse ? "lg:order-2" : ""}`}
				initial={shouldReduceMotion || !shouldAnimate ? false : "hidden"}
				animate={isRevealed ? "visible" : "hidden"}
				variants={sectionRevealStagger}
			>
				<motion.span className="home-feature-badge" variants={reveal}>
					<span className="home-feature-badge__icon">{feature.icon}</span>
					{t("badge")}
				</motion.span>
				<motion.h3
					id={headlineId}
					variants={reveal}
					className="mt-4 text-balance text-2xl font-semibold tracking-tight text-(--text-h) sm:text-3xl"
				>
					{t("headline")}
				</motion.h3>
				<motion.p
					variants={reveal}
					className="mt-7 max-w-[52ch] text-pretty text-sm leading-relaxed text-(--text) sm:mt-8"
				>
					{t("description")}
				</motion.p>
				<FeatureCheckList items={bullets} />
				<motion.div variants={reveal} className="mt-6">
					<Link href={feature.href} className="home-link-arrow text-sm">
						{t("link")}
						<ArrowUpRight className="size-[15px]" aria-hidden />
					</Link>
				</motion.div>
			</motion.div>

			<motion.div
				className={`relative w-full min-w-0 ${feature.reverse ? "lg:order-1" : ""}`}
				initial={shouldReduceMotion || !shouldAnimate ? false : "hidden"}
				animate={isRevealed ? "visible" : "hidden"}
				variants={{
					...reveal,
					visible: {
						...reveal.visible,
						transition: shouldAnimate
							? {
									duration: 0.55,
									ease: appleRevealEase,
									delay: 0.12 + textDelay,
								}
							: { duration: 0 },
					},
				}}
			>
				{feature.demo}
			</motion.div>
		</article>
	);
}

export default function CoreServices() {
	const t = useCopy("home.core_services");
	const { ref, isRevealed, shouldAnimate } = useSectionReveal();
	const shouldReduceMotion = useReducedMotion();

	const features: FeatureConfig[] = [
		{
			id: "ai",
			icon: <Bot className="size-[22px]" aria-hidden />,
			demo: <AiDemo />,
			href: "/services#ai",
		},
		{
			id: "engineering",
			icon: <Code2 className="size-[22px]" aria-hidden />,
			reverse: true,
			demo: <CodeDemo />,
			href: "/services#custom",
		},
		{
			id: "pod",
			icon: <Users className="size-[22px]" aria-hidden />,
			demo: <PodDemo />,
			href: "/services#team",
		},
		{
			id: "devops",
			icon: <Cloud className="size-[22px]" aria-hidden />,
			reverse: true,
			demo: <PipelineDemo />,
			href: "/services#cloud",
		},
	];

	return (
		<section ref={ref} id="services" className="home-section">
			<div className="home-wrap">
				<motion.div
					initial={
						shouldReduceMotion || !shouldAnimate
							? false
							: sectionRevealItem.hidden
					}
					animate={
						isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden
					}
					transition={sectionItemTransition(
						shouldAnimate,
						0,
						!!shouldReduceMotion,
					)}
				>
					<SectionHead
						eyebrow={t("eyebrow")}
						headline={t("headline")}
						description={t("description")}
						descriptionClassName="mt-7 text-sm sm:mt-8"
					/>
				</motion.div>

				<div className="mt-14 space-y-20 lg:mt-20 lg:space-y-28">
					{features.map((feature, index) => (
						<FeatureSection key={feature.id} feature={feature} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}
