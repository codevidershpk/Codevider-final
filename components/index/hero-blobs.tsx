"use client";

interface HeroBlobsProps {
	/** Pause the slow drifting animation (e.g. if reduced motion is requested) */
	paused?: boolean;
	/** Additional class name */
	className?: string;
}

/**
 * HeroBlobs: Soft, brand-coherent ambient glows. Corners stay quiet so the
 * opaque dashboard never turns a centered radial into a "black hole" halo;
 * the two center blobs sit in the visible gutter (between copy and card)
 * so their cores stay on screen.
 */
export default function HeroBlobs({
	paused = false,
	className = "",
}: HeroBlobsProps) {
	const playState = paused ? "paused" : "running";

	return (
		<div
			className={`pointer-events-none absolute inset-0 z-1 overflow-hidden select-none ${className}`}
			aria-hidden="true"
		>
			{/* Primary brand blue — top-left, behind the H1 */}
			<div
				className="home-hero__blob home-hero__blob--1"
				style={{
					top: "-12%",
					left: "-10%",
					width: "min(60vw, 620px)",
					height: "min(60vw, 620px)",
					background:
						"radial-gradient(closest-side, rgba(36, 105, 255, 0.34) 0%, rgba(36, 105, 255, 0.12) 48%, transparent 72%)",
					animationPlayState: playState,
				}}
			/>

			{/* Corner bleed — far top-right edge only, never centered behind the card */}
			<div
				className="home-hero__blob home-hero__blob--2"
				style={{
					top: "-24%",
					right: "-14%",
					width: "min(50vw, 560px)",
					height: "min(50vw, 560px)",
					background:
						"radial-gradient(closest-side, rgba(107, 155, 255, 0.2) 0%, rgba(99, 102, 241, 0.07) 50%, transparent 72%)",
					animationPlayState: playState,
				}}
			/>

			{/* Faint grounding wash — bottom-center, keeps the fold from going flat */}
			<div
				className="home-hero__blob home-hero__blob--3"
				style={{
					bottom: "-28%",
					left: "28%",
					width: "min(52vw, 560px)",
					height: "min(52vw, 560px)",
					background:
						"radial-gradient(closest-side, rgba(56, 130, 255, 0.14) 0%, rgba(56, 130, 255, 0.05) 50%, transparent 72%)",
					animationPlayState: playState,
				}}
			/>

			{/* Center glow I — blue, upper-center gutter */}
			<div
				className="home-hero__blob home-hero__blob--4"
				style={{
					top: "18%",
					left: "45%",
					width: "min(38vw, 440px)",
					height: "min(38vw, 440px)",
					background:
						"radial-gradient(closest-side, rgba(59, 130, 246, 0.55) 0%, rgba(37, 99, 235, 0.22) 52%, transparent 72%)",
					animationPlayState: playState,
				}}
			/>

			{/* Center glow II — cyan, lower-center gutter */}
			<div
				className="home-hero__blob home-hero__blob--5"
				style={{
					bottom: "8%",
					left: "42%",
					width: "min(40vw, 460px)",
					height: "min(40vw, 460px)",
					background:
						"radial-gradient(closest-side, rgba(34, 211, 238, 0.42) 0%, rgba(14, 165, 183, 0.15) 52%, transparent 72%)",
					animationPlayState: playState,
				}}
			/>
		</div>
	);
}
