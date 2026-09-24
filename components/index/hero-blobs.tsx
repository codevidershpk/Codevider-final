"use client";

import { type CSSProperties, useEffect, useRef } from "react";

interface HeroBlobsProps {
	/** Pause the organic drift (e.g. if reduced motion is requested) */
	paused?: boolean;
	/** Additional class name */
	className?: string;
}

/**
 * Blob descriptor. `style` anchors the glow; the motion fields bound the
 * random wander — each move picks a fresh target, glide duration, and rest
 * pause inside these ranges, so the field never settles into a visible loop.
 */
interface BlobSpec {
	style: CSSProperties;
	/** Max wander in px from the anchor point (x and y) */
	drift: number;
	/** Min/max scale multiplier per move */
	scale: [number, number];
	/** Min/max rest time in ms between moves */
	rest: [number, number];
	/** Min/max glide duration in ms of each move */
	glide: [number, number];
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Slow sinusoidal ease — no snap at either end of a move */
const EASE = "cubic-bezier(0.37, 0, 0.63, 1)";

const BLOBS: readonly BlobSpec[] = [
	{
		/* Primary brand blue — top-left, behind the H1 */
		style: {
			top: "-12%",
			left: "-10%",
			width: "min(60vw, 620px)",
			height: "min(60vw, 620px)",
			background:
				"radial-gradient(closest-side, rgba(36, 105, 255, 0.34) 0%, rgba(36, 105, 255, 0.12) 48%, transparent 72%)",
			filter: "blur(100px)",
		},
		drift: 70,
		scale: [0.94, 1.08],
		rest: [800, 2600],
		glide: [9000, 14000],
	},
	{
		/* Corner bleed — far top-right edge only, never centered behind the card */
		style: {
			top: "-24%",
			right: "-14%",
			width: "min(50vw, 560px)",
			height: "min(50vw, 560px)",
			background:
				"radial-gradient(closest-side, rgba(107, 155, 255, 0.2) 0%, rgba(99, 102, 241, 0.07) 50%, transparent 72%)",
			filter: "blur(110px)",
		},
		drift: 60,
		scale: [0.95, 1.06],
		rest: [1000, 3000],
		glide: [10000, 16000],
	},
	{
		/* Faint grounding wash — bottom-center, keeps the fold from going flat */
		style: {
			bottom: "-28%",
			left: "28%",
			width: "min(52vw, 560px)",
			height: "min(52vw, 560px)",
			background:
				"radial-gradient(closest-side, rgba(56, 130, 255, 0.14) 0%, rgba(56, 130, 255, 0.05) 50%, transparent 72%)",
			filter: "blur(110px)",
		},
		drift: 55,
		scale: [0.95, 1.05],
		rest: [900, 2800],
		glide: [9000, 15000],
	},
	{
		/* Center glow I — blue, upper-center gutter */
		style: {
			top: "18%",
			left: "45%",
			width: "min(38vw, 440px)",
			height: "min(38vw, 440px)",
			background:
				"radial-gradient(closest-side, rgba(59, 130, 246, 0.55) 0%, rgba(37, 99, 235, 0.22) 52%, transparent 72%)",
			filter: "blur(70px)",
		},
		drift: 45,
		scale: [0.93, 1.08],
		rest: [700, 2200],
		glide: [8000, 13000],
	},
	{
		/* Center glow II — cyan, lower-center gutter */
		style: {
			bottom: "8%",
			left: "42%",
			width: "min(40vw, 460px)",
			height: "min(40vw, 460px)",
			background:
				"radial-gradient(closest-side, rgba(34, 211, 238, 0.42) 0%, rgba(14, 165, 183, 0.15) 52%, transparent 72%)",
			filter: "blur(80px)",
		},
		drift: 45,
		scale: [0.94, 1.07],
		rest: [800, 2400],
		glide: [8000, 14000],
	},
];

/**
 * HeroBlobs: the original soft, brand-coherent ambient glows, now wandering
 * organically. Instead of fixed CSS keyframe loops, each blob runs its own
 * random walk — a new target offset/scale, glide length, and rest pause every
 * move — so the backdrop feels alive and never visibly repeats.
 *
 * Corners stay quiet so the opaque dashboard never turns a centered radial
 * into a "black hole" halo; the two center blobs sit in the visible gutter
 * (between copy and card) so their cores stay on screen.
 */
export default function HeroBlobs({
	paused = false,
	className = "",
}: HeroBlobsProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const root = rootRef.current;
		if (paused || !root) return;

		const timers: number[] = [];
		let running = false;
		let onScreen = true;

		const wander = (i: number) => {
			const el = blobRefs.current[i];
			const spec = BLOBS[i];
			if (!el || !spec) return;

			const x = rand(-spec.drift, spec.drift);
			const y = rand(-spec.drift, spec.drift);
			const s = rand(spec.scale[0], spec.scale[1]);
			const glide = rand(spec.glide[0], spec.glide[1]);

			el.style.transition = `transform ${glide}ms ${EASE}`;
			el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;

			// Rest a beat at the destination, then pick the next one
			timers[i] = window.setTimeout(
				() => wander(i),
				glide + rand(spec.rest[0], spec.rest[1]),
			);
		};

		const start = () => {
			if (running) return;
			running = true;
			// Stagger the first move so the field doesn't lurch in unison
			BLOBS.forEach((_, i) => {
				timers[i] = window.setTimeout(() => wander(i), rand(0, 2500));
			});
		};

		// Freeze each blob where it is so the big blurred layers stop
		// animating while the hero is off screen or the tab is hidden.
		const stop = () => {
			if (!running) return;
			running = false;
			for (const timer of timers) window.clearTimeout(timer);
			for (const el of blobRefs.current) {
				if (!el) continue;
				const current = getComputedStyle(el).transform;
				el.style.transition = "none";
				el.style.transform = current === "none" ? "" : current;
			}
		};

		const sync = () => (onScreen && !document.hidden ? start() : stop());

		const observer = new IntersectionObserver(([entry]) => {
			onScreen = entry?.isIntersecting ?? true;
			sync();
		});
		observer.observe(root);
		document.addEventListener("visibilitychange", sync);
		sync();

		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", sync);
			for (const timer of timers) window.clearTimeout(timer);
		};
	}, [paused]);

	return (
		<div
			ref={rootRef}
			className={`pointer-events-none absolute inset-0 z-1 overflow-hidden select-none ${className}`}
			aria-hidden="true"
		>
			{BLOBS.map((blob, index) => (
				<div
					key={index}
					ref={(el) => {
						blobRefs.current[index] = el;
					}}
					className="home-hero__blob"
					style={blob.style}
				/>
			))}
		</div>
	);
}
