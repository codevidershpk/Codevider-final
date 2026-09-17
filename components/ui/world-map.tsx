"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { revealTransition, useSectionReveal } from "@/hooks/use-section-reveal";

type MapDot = {
	start: { lat: number; lng: number; label?: string };
	end: { lat: number; lng: number; label?: string };
};

type WorldMapProps = {
	dots?: MapDot[];
};

const MAP_STYLES = {
	light: {
		line: "#2563eb",
		strokeWidth: 2.6,
		glowStrokeWidth: 5,
		pointRadius: 4.5,
	},
	dark: {
		line: "#4ec4e0",
		strokeWidth: 2.2,
		glowStrokeWidth: 4.5,
		pointRadius: 4,
	},
} as const;

const COMPACT_MAP_MEDIA_QUERY = "(max-width: 767px)";

function mapSvgSrc(theme: "light" | "dark", isCompact: boolean) {
	const size = isCompact ? "compact" : "default";
	return `/maps/world-${size}-${theme}.svg`;
}

function useCompactViewport() {
	const [isCompact, setIsCompact] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(COMPACT_MAP_MEDIA_QUERY);
		const sync = () => setIsCompact(mediaQuery.matches);

		sync();
		mediaQuery.addEventListener("change", sync);
		return () => mediaQuery.removeEventListener("change", sync);
	}, []);

	return isCompact;
}

function projectPoint(lat: number, lng: number) {
	const x = (lng + 180) * (800 / 360);
	const y = (90 - lat) * (400 / 180);
	return { x, y };
}

function createCurvedPath(
	start: { x: number; y: number },
	end: { x: number; y: number },
) {
	const midX = (start.x + end.x) / 2;
	const midY = Math.min(start.y, end.y) - 50;
	return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

function AnimatedPath({
	d,
	index,
	isRevealed,
	shouldAnimate,
	shouldReduceMotion,
	strokeWidth,
	glowStrokeWidth,
}: {
	d: string;
	index: number;
	isRevealed: boolean;
	shouldAnimate: boolean;
	shouldReduceMotion: boolean | null;
	strokeWidth: number;
	glowStrokeWidth: number;
}) {
	return (
		<g>
			<motion.path
				d={d}
				fill="none"
				stroke="url(#world-map-path-gradient)"
				strokeWidth={glowStrokeWidth}
				strokeOpacity={0.22}
				initial={
					shouldReduceMotion || !shouldAnimate ? false : { pathLength: 0 }
				}
				animate={isRevealed ? { pathLength: 1 } : { pathLength: 0 }}
				transition={revealTransition(shouldAnimate, {
					duration: 1.5,
					delay: 0.3 * index,
					ease: "easeOut" as const,
				})}
			/>
			<motion.path
				d={d}
				fill="none"
				stroke="url(#world-map-path-gradient)"
				strokeWidth={strokeWidth}
				initial={
					shouldReduceMotion || !shouldAnimate ? false : { pathLength: 0 }
				}
				animate={isRevealed ? { pathLength: 1 } : { pathLength: 0 }}
				transition={revealTransition(shouldAnimate, {
					duration: 1.5,
					delay: 0.3 * index,
					ease: "easeOut" as const,
				})}
			/>
		</g>
	);
}

export default function WorldMap({ dots = [] }: WorldMapProps) {
	const { theme } = useTheme();
	const isCompact = useCompactViewport();
	const { ref, isRevealed, shouldAnimate } = useSectionReveal<HTMLDivElement>({
		margin: "0px",
		amount: 0.3,
	});
	const shouldReduceMotion = useReducedMotion();
	const styles = MAP_STYLES[theme];

	const mapShellClassName = isCompact
		? "relative mx-auto w-full min-h-[clamp(70px,30vw,100px)] aspect-2/1 max-w-[min(100%,96rem)]"
		: "relative mx-auto w-full min-h-[clamp(300px,44vw,560px)] aspect-2/1 max-w-[min(100%,96rem)]";

	return (
		<div ref={ref} className={mapShellClassName}>
			<Image
				src={mapSvgSrc(theme, isCompact)}
				className="pointer-events-none h-full w-full select-none object-contain"
				alt=""
				height={560}
				width={1120}
				draggable={false}
				unoptimized
				aria-hidden
			/>
			<svg
				viewBox="0 0 800 400"
				className="pointer-events-none absolute inset-0 size-full select-none"
				preserveAspectRatio="xMidYMid meet"
				aria-hidden
			>
				<defs>
					<linearGradient
						id="world-map-path-gradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="0%"
					>
						<stop offset="0%" stopColor={styles.line} stopOpacity="0" />
						<stop offset="8%" stopColor={styles.line} stopOpacity="1" />
						<stop offset="92%" stopColor={styles.line} stopOpacity="1" />
						<stop offset="100%" stopColor={styles.line} stopOpacity="0" />
					</linearGradient>
				</defs>

				{dots.map((dot, i) => {
					const startPoint = projectPoint(dot.start.lat, dot.start.lng);
					const endPoint = projectPoint(dot.end.lat, dot.end.lng);

					return (
						<AnimatedPath
							key={`path-${i}`}
							d={createCurvedPath(startPoint, endPoint)}
							index={i}
							isRevealed={isRevealed}
							shouldAnimate={shouldAnimate}
							shouldReduceMotion={shouldReduceMotion}
							strokeWidth={styles.strokeWidth}
							glowStrokeWidth={styles.glowStrokeWidth}
						/>
					);
				})}

				{dots.flatMap((dot, i) => {
					const startPoint = projectPoint(dot.start.lat, dot.start.lng);
					const endPoint = projectPoint(dot.end.lat, dot.end.lng);
					const points = [
						{ point: startPoint, glow: i === 0 },
						{ point: endPoint, glow: i < 3 },
					];

					return points.map(({ point, glow }, pointIndex) => (
						<g key={`points-${i}-${pointIndex}`}>
							<circle
								cx={point.x}
								cy={point.y}
								r={styles.pointRadius}
								fill={styles.line}
							/>
							{glow && !shouldReduceMotion && !isCompact ? (
								<circle
									cx={point.x}
									cy={point.y}
									r={styles.pointRadius}
									fill={styles.line}
									opacity="0.5"
								>
									<animate
										attributeName="r"
										from={styles.pointRadius}
										to={styles.pointRadius + 8}
										dur="1.8s"
										begin={`${i * 0.2}s`}
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										from="0.5"
										to="0"
										dur="1.8s"
										begin={`${i * 0.2}s`}
										repeatCount="indefinite"
									/>
								</circle>
							) : null}
						</g>
					));
				})}
			</svg>
		</div>
	);
}
