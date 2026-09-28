"use client";

import { useEffect, useRef } from "react";

type Rgb = { r: number; g: number; b: number };

type Glyph = {
	char: string;
	rgb: Rgb;
	fromRgb: Rgb;
	targetRgb: Rgb;
	colorProgress: number;
};

const FALLBACK_RGB: Rgb = { r: 255, g: 255, b: 255 };

const DEFAULT_COLORS = [
	"#0a2238",
	"#0d2e4c",
	"#123a5e",
	"#164a74",
	"#1a5c8e",
	"#1f74ae",
	"#2a92cc",
	"#4eb6e4",
];

const DEFAULT_CHARACTERS = "0011{}[]<>/|;:.,_+-=*#@$ABCDEFGHJKLMNPQRSTUVWXYZ";

function hexToRgb(hex: string): Rgb | null {
	const normalized = hex.replace(
		/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
		(_m, r: string, g: string, b: string) => `${r}${r}${g}${g}${b}${b}`,
	);
	const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
	if (!match) return null;
	return {
		r: Number.parseInt(match[1], 16),
		g: Number.parseInt(match[2], 16),
		b: Number.parseInt(match[3], 16),
	};
}

function mixRgb(start: Rgb, end: Rgb, factor: number): Rgb {
	return {
		r: Math.round(start.r + (end.r - start.r) * factor),
		g: Math.round(start.g + (end.g - start.g) * factor),
		b: Math.round(start.b + (end.b - start.b) * factor),
	};
}

function rgbToCss({ r, g, b }: Rgb) {
	return `rgb(${r}, ${g}, ${b})`;
}

type LetterGlitchProps = {
	glitchColors?: string[];
	glitchSpeed?: number;
	smooth?: boolean;
	characters?: string;
	className?: string;
};

/**
 * Canvas letter-grid background adapted from React Bits Letter Glitch.
 * Pauses off-screen, in hidden tabs, and when the user prefers reduced motion.
 */
export function LetterGlitch({
	glitchColors = DEFAULT_COLORS,
	glitchSpeed = 70,
	smooth = true,
	characters = DEFAULT_CHARACTERS,
	className = "",
}: LetterGlitchProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const configRef = useRef({ glitchColors, glitchSpeed, smooth, characters });
	configRef.current = { glitchColors, glitchSpeed, smooth, characters };

	useEffect(() => {
		const canvas = canvasRef.current;
		const parent = canvas?.parentElement;
		if (!canvas || !parent) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const letters: Glyph[] = [];
		// Per-cell position and vignette alpha, computed once per resize.
		let cellX = new Float32Array(0);
		let cellY = new Float32Array(0);
		let cellAlpha = new Float32Array(0);
		// Only cells outside the vignette are ever drawn or glitched.
		let visible: number[] = [];
		const fading = new Set<number>();
		const symbols = Array.from(configRef.current.characters);
		const palette = configRef.current.glitchColors;

		let fontSize = 16;
		let charWidth = 10;
		let charHeight = 20;
		let running = false;
		let onScreen = true;
		let frame = 0;
		let lastGlitch = performance.now();
		let lastTick = 0;
		let resizeTimer = 0;

		const randomChar = () =>
			symbols[Math.floor(Math.random() * symbols.length)] ?? "0";

		const randomRgb = (): Rgb => {
			const hex =
				palette[Math.floor(Math.random() * palette.length)] ?? palette[0];
			return hexToRgb(hex) ?? FALLBACK_RGB;
		};

		const setFont = () => {
			ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
			ctx.textBaseline = "top";
		};

		const drawCell = (i: number, clear: boolean) => {
			const letter = letters[i];
			if (!letter) return;
			if (clear) ctx.clearRect(cellX[i], cellY[i], charWidth, charHeight);
			ctx.globalAlpha = cellAlpha[i] * 0.88;
			ctx.fillStyle = rgbToCss(letter.rgb);
			ctx.fillText(letter.char, cellX[i], cellY[i]);
		};

		const drawAll = () => {
			const { width, height } = canvas.getBoundingClientRect();
			ctx.clearRect(0, 0, width, height);
			setFont();
			for (const i of visible) drawCell(i, false);
			ctx.globalAlpha = 1;
		};

		const seedGrid = (columns: number, rows: number) => {
			const { width, height } = canvas.getBoundingClientRect();
			const total = columns * rows;
			letters.length = 0;
			fading.clear();
			cellX = new Float32Array(total);
			cellY = new Float32Array(total);
			cellAlpha = new Float32Array(total);
			visible = [];

			for (let i = 0; i < total; i++) {
				const x = (i % columns) * charWidth;
				const y = Math.floor(i / columns) * charHeight;
				const dist = Math.hypot(
					(x / width - 0.5) * 2.1,
					(y / height - 0.5) * 2.4,
				);
				const alpha = Math.min(1, Math.max(0, (dist - 0.5) / 0.68));
				cellX[i] = x;
				cellY[i] = y;
				cellAlpha[i] = alpha;
				if (alpha >= 0.05) visible.push(i);

				const rgb = randomRgb();
				letters.push({
					char: randomChar(),
					rgb,
					fromRgb: rgb,
					targetRgb: randomRgb(),
					colorProgress: 1,
				});
			}
		};

		const resize = () => {
			const coarse = window.matchMedia("(pointer: coarse)").matches;
			fontSize = coarse ? 16 : 15;
			charWidth = coarse ? 13 : 11;
			charHeight = coarse ? 26 : 22;

			const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
			const rect = parent.getBoundingClientRect();
			canvas.width = Math.max(1, Math.floor(rect.width * dpr));
			canvas.height = Math.max(1, Math.floor(rect.height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			seedGrid(
				Math.ceil(rect.width / charWidth),
				Math.ceil(rect.height / charHeight),
			);
			drawAll();
		};

		const updateLetters = () => {
			const updateCount = Math.max(1, Math.floor(visible.length * 0.045));
			for (let n = 0; n < updateCount; n++) {
				const index = visible[Math.floor(Math.random() * visible.length)];
				const letter = index === undefined ? undefined : letters[index];
				if (index === undefined || !letter) continue;
				letter.char = randomChar();
				letter.fromRgb = letter.rgb;
				letter.targetRgb = randomRgb();
				if (!configRef.current.smooth) {
					letter.rgb = letter.targetRgb;
					letter.colorProgress = 1;
				} else {
					letter.colorProgress = 0;
				}
				fading.add(index);
			}
		};

		// Redraws only the cells whose glyph or colour changed this tick.
		const tick = () => {
			if (fading.size === 0) return;
			setFont();
			for (const i of fading) {
				const letter = letters[i];
				if (!letter) {
					fading.delete(i);
					continue;
				}
				if (letter.colorProgress < 1) {
					letter.colorProgress = Math.min(1, letter.colorProgress + 0.1);
					letter.rgb = mixRgb(
						letter.fromRgb,
						letter.targetRgb,
						letter.colorProgress,
					);
				}
				drawCell(i, true);
				if (letter.colorProgress >= 1) fading.delete(i);
			}
			ctx.globalAlpha = 1;
		};

		// ~30fps is plenty for a background texture and halves main-thread work.
		const animate = (now: number) => {
			if (!running) return;
			if (now - lastTick >= 32) {
				lastTick = now;
				if (now - lastGlitch >= configRef.current.glitchSpeed) {
					updateLetters();
					lastGlitch = now;
				}
				tick();
			}
			frame = requestAnimationFrame(animate);
		};

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		);

		const start = () => {
			if (running || prefersReduced.matches) return;
			running = true;
			lastGlitch = performance.now();
			frame = requestAnimationFrame(animate);
		};

		const stop = () => {
			if (!running) return;
			running = false;
			cancelAnimationFrame(frame);
		};

		const sync = () => {
			if (prefersReduced.matches || document.hidden || !onScreen) {
				stop();
				return;
			}
			start();
		};

		resize();
		sync();

		const observer = new IntersectionObserver(([entry]) => {
			onScreen = entry?.isIntersecting ?? true;
			sync();
		});
		observer.observe(parent);

		const onResize = () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				stop();
				resize();
				sync();
			}, 120);
		};

		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(parent);
		document.addEventListener("visibilitychange", sync);
		prefersReduced.addEventListener("change", sync);

		return () => {
			stop();
			observer.disconnect();
			resizeObserver.disconnect();
			document.removeEventListener("visibilitychange", sync);
			prefersReduced.removeEventListener("change", sync);
			window.clearTimeout(resizeTimer);
		};
	}, []);

	return <canvas ref={canvasRef} className={className} aria-hidden />;
}
