import { Activity, Target, TrendingUp, Users } from "lucide-react";
import type { CSSProperties } from "react";
import { useCopy } from "@/lib/copy";

const REVENUE_BARS = [38, 52, 44, 58, 49, 64, 55, 71, 63, 77, 68, 84] as const;
const PEAK_BAR_INDEX = REVENUE_BARS.findIndex((bar) => bar === 84);
const LATEST_BAR_INDEX = REVENUE_BARS.length - 1;
const CHART_HEIGHT_PX = 112;
const BAR_MIN_HEIGHT_PX = 8;

/** Stagger slot for the CSS entrance (see `.hero-dash-stage` in globals.css). */
function stage(index: number): CSSProperties {
	return { "--i": index } as CSSProperties;
}

/**
 * Calculates bar height in pixels.
 *
 * @param value - Percentage value for the bar.
 * @returns Calculated height in pixels.
 */
function barHeightPx(value: number) {
	return Math.max(
		BAR_MIN_HEIGHT_PX,
		Math.round((value / 100) * CHART_HEIGHT_PX),
	);
}

const METRICS_BASE = [
	{
		key: "performance",
		amount: "284K",
		useCurrency: true,
		deltaKey: "performance_delta",
		icon: TrendingUp,
	},
	{
		key: "growth",
		amount: "12.4K",
		useCurrency: false,
		deltaKey: "growth_delta",
		icon: Users,
	},
	{
		key: "system_health",
		amount: "99.9%",
		useCurrency: false,
		deltaKey: "system_health_delta",
		icon: Activity,
	},
	{
		key: "leads",
		amount: "68%",
		useCurrency: false,
		deltaKey: "leads_delta",
		icon: Target,
	},
] as const;

/**
 * Metric card component displaying label, value, delta, and icon.
 */
function MetricCard({
	label,
	value,
	delta,
	icon: Icon,
}: {
	label: string;
	value: string;
	delta: string;
	icon: React.ElementType;
}) {
	return (
		<>
			<div className="flex items-center justify-between gap-2">
				<span className="text-[0.7rem] font-medium text-(--dash-muted)">
					{label}
				</span>
				<Icon className="size-3.5 shrink-0 text-(--dash-brand)" aria-hidden />
			</div>
			<p className="mt-1 font-(family-name:--mono) text-[0.95rem] font-medium tabular-nums tracking-tight text-(--dash-text)">
				{value}
			</p>
			<p className="mt-0.5 text-[0.72rem] font-medium leading-snug text-(--dash-success)">
				{delta}
			</p>
		</>
	);
}

/**
 * Hero dashboard mockup with metrics and a revenue chart.
 *
 * The staged entrance is pure CSS (@starting-style), so the card paints
 * straight from the static HTML instead of waiting for hydration, and the
 * bars grow with a compositor-only scaleY rather than animating height.
 */
export default function HeroDashboard() {
	const t = useCopy("home.dashboard");
	const tHome = useCopy("home");
	const currency = tHome("base_currency");
	const currencyAfter = tHome("base_currency_position") === "after";
	const fmt = (amount: string) =>
		currencyAfter ? `${amount}${currency}` : `${currency}${amount}`;

	return (
		<div className="hero-dash-window relative w-full overflow-hidden rounded-2xl border border-(--dash-border) bg-(--dash-canvas) shadow-(--dash-shadow)">
			<div
				className="hero-dash-stage hero-dash-titlebar flex items-center gap-3 border-b border-(--dash-border) px-4 py-2.5"
				style={stage(1)}
			>
				<div className="flex items-center gap-1.5" aria-hidden>
					<span className="size-2.5 rounded-full bg-[#ff5f57]" />
					<span className="size-2.5 rounded-full bg-[#febc2e]" />
					<span className="size-2.5 rounded-full bg-[#28c840]" />
				</div>
				<div className="min-w-0 flex-1 truncate rounded-md bg-(--dash-surface) px-3 py-1 text-center font-(family-name:--mono) text-[0.68rem] text-(--dash-muted)">
					{t("window_url")}
				</div>
			</div>

			<div className="space-y-3 p-4">
				<div className="grid grid-cols-2 gap-2.5">
					{METRICS_BASE.map(
						({ key, amount, useCurrency, deltaKey, icon }, index) => (
							<div
								key={key}
								className="hero-dash-stage hero-dash-surface rounded-xl p-3"
								style={stage(2 + index)}
							>
								<MetricCard
									label={t(key)}
									value={useCurrency ? fmt(amount) : amount}
									delta={t(deltaKey)}
									icon={icon}
								/>
							</div>
						),
					)}
				</div>

				<div
					className="hero-dash-stage hero-dash-surface rounded-xl p-3.5"
					style={stage(6)}
				>
					<div
						className="hero-dash-stage flex items-baseline justify-between gap-2"
						style={stage(6.4)}
					>
						<p className="text-sm font-semibold text-(--dash-text)">
							{t("revenue_overview")}
						</p>
						<span className="text-[0.7rem] text-(--dash-muted)">
							{t("revenue_period")}
						</span>
					</div>

					<div
						className="hero-dash-chart mt-3 flex h-28 items-end gap-1.5"
						role="img"
						aria-label={t("revenue_chart_label")}
					>
						{REVENUE_BARS.map((value, index) => (
							<div
								key={index}
								className={`hero-dash-bar flex-1 rounded-t-[4px]${
									index === PEAK_BAR_INDEX ? " hero-dash-bar--peak" : ""
								}${index === LATEST_BAR_INDEX ? " hero-dash-bar--latest" : ""}`}
								style={
									{
										height: barHeightPx(value),
										"--bar": index,
									} as CSSProperties
								}
							/>
						))}
					</div>

					<div
						className="hero-dash-stage hero-dash-stage--axis mt-2 flex justify-between font-(family-name:--mono) text-[0.65rem] text-(--dash-muted)"
						style={stage(6 + REVENUE_BARS.length * 0.375)}
					>
						<span>{t("week_1")}</span>
						<span>{t("week_6")}</span>
						<span>{t("week_12")}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
