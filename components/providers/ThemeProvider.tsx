"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

type ThemeCoords = { x: number; y: number };

interface ThemeContextType {
	theme: Theme;
	isThemeTransitioning: boolean;
	setTheme: (theme: Theme) => void;
	toggleTheme: (coords?: ThemeCoords) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme";
const THEME_TRANSITION_MS = 750;

type RevealCircle = { x: number; y: number; endRadius: number; start: number };

type Reveal = {
	transition: ViewTransition;
	circles: RevealCircle[];
	style: HTMLStyleElement | null;
	frame: number;
};

/** cubic-bezier(0.22, 1, 0.36, 1), solved for y at time x. */
function easeReveal(t: number) {
	const x1 = 0.22;
	const y1 = 1;
	const x2 = 0.36;
	const y2 = 1;
	const bezier = (u: number, p1: number, p2: number) =>
		3 * p1 * u * (1 - u) ** 2 + 3 * p2 * u ** 2 * (1 - u) + u ** 3;
	let lo = 0;
	let hi = 1;
	for (let i = 0; i < 20; i++) {
		const mid = (lo + hi) / 2;
		if (bezier(mid, x1, x2) < t) lo = mid;
		else hi = mid;
	}
	return bezier((lo + hi) / 2, y1, y2);
}

function circlePath(x: number, y: number, r: number) {
	if (r <= 0) return `M${x} ${y}Z`;
	return `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

function supportsRadialViewTransition(): boolean {
	if (typeof document.startViewTransition !== "function") {
		return false;
	}

	// Firefox exposes the API but not pseudo-element WAAPI — causes a double-flash.
	return !/Firefox\//i.test(navigator.userAgent);
}

function getStoredTheme(): Theme | null {
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === "light" || stored === "dark" ? stored : null;
}

function getSystemTheme(): Theme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme: Theme, options?: { holdTransitions?: boolean }) {
	const root = document.documentElement;
	root.classList.add("theme-switching");
	root.classList.toggle("dark", theme === "dark");

	if (!options?.holdTransitions) {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				root.classList.remove("theme-switching");
			});
		});
	}
}

function releaseThemeSwitching() {
	document.documentElement.classList.remove("theme-switching");
}

function getRevealRadius(x: number, y: number) {
	return Math.hypot(
		Math.max(x, window.innerWidth - x),
		Math.max(y, window.innerHeight - y),
	);
}

function subscribeToTheme(callback: () => void) {
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
	return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const theme = useSyncExternalStore(
		subscribeToTheme,
		getThemeSnapshot,
		getServerThemeSnapshot,
	);
	const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
	// Theme the latest press is heading to while a reveal is still running.
	const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);
	const themeRef = useRef(theme);
	const targetThemeRef = useRef<Theme | null>(null);
	const activeReveal = useRef<Reveal | null>(null);
	themeRef.current = theme;

	useEffect(() => {
		const initial = getStoredTheme() ?? getSystemTheme();
		if (getThemeSnapshot() !== initial) {
			applyTheme(initial);
		}
	}, []);

	const setTheme = useCallback((nextTheme: Theme) => {
		localStorage.setItem(STORAGE_KEY, nextTheme);
		applyTheme(nextTheme);
	}, []);

	const toggleTheme = useCallback((coords?: ThemeCoords) => {
		const currentTheme = targetThemeRef.current ?? themeRef.current;
		const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const canAnimate = supportsRadialViewTransition() && !prefersReducedMotion;
		const x = coords?.x ?? window.innerWidth / 2;
		const y = coords?.y ?? window.innerHeight / 2;
		const circle: RevealCircle = {
			x,
			y,
			endRadius: getRevealRadius(x, y),
			start: performance.now(),
		};

		localStorage.setItem(STORAGE_KEY, nextTheme);

		const running = activeReveal.current;
		if (running && canAnimate) {
			// Every press mid-reveal adds another circle expanding from the press
			// point. Overlapping circles alternate themes (even-odd), so each press
			// visibly radiates the next theme instead of snapping.
			running.circles.push(circle);
			targetThemeRef.current = nextTheme;
			setPendingTheme(nextTheme);
			return;
		}

		if (!canAnimate) {
			running?.transition.skipTransition();
			flushSync(() => applyTheme(nextTheme));
			return;
		}

		const baseTheme = themeRef.current;
		const liveTheme = nextTheme;
		const reveal: Reveal = {
			transition: document.startViewTransition(() => {
				flushSync(() => applyTheme(liveTheme, { holdTransitions: true }));
			}),
			circles: [circle],
			style: null,
			frame: 0,
		};
		activeReveal.current = reveal;
		targetThemeRef.current = nextTheme;
		setPendingTheme(nextTheme);
		setIsThemeTransitioning(true);

		const finish = () => {
			if (activeReveal.current !== reveal) return;
			cancelAnimationFrame(reveal.frame);
			reveal.style?.remove();
			activeReveal.current = null;
			targetThemeRef.current = null;
			releaseThemeSwitching();
			setPendingTheme(null);
			setIsThemeTransitioning(false);
		};

		const tick = () => {
			const now = performance.now();
			let done = true;
			const paths = reveal.circles.map((c) => {
				const progress = Math.min(
					1,
					Math.max(0, (now - c.start) / THEME_TRANSITION_MS),
				);
				if (progress < 1) done = false;
				return circlePath(c.x, c.y, c.endRadius * easeReveal(progress));
			});

			if (done) {
				// Fully covered: the circle count's parity decides the final theme.
				const finalTheme =
					reveal.circles.length % 2 === 1 ? liveTheme : baseTheme;
				if (finalTheme !== liveTheme) {
					applyTheme(finalTheme, { holdTransitions: true });
				}
				reveal.transition.skipTransition();
				finish();
				return;
			}

			if (reveal.style) {
				reveal.style.textContent = `::view-transition-new(root){clip-path:path(evenodd,"${paths.join(" ")}")}`;
			}
			reveal.frame = requestAnimationFrame(tick);
		};

		reveal.transition.ready
			.then(() => {
				if (activeReveal.current !== reveal) return;
				const style = document.createElement("style");
				document.head.appendChild(style);
				reveal.style = style;
				// Keeps the transition alive while the rAF loop drives the clip.
				document.documentElement.animate(
					{ opacity: [1, 1] },
					{ duration: 60_000, pseudoElement: "::view-transition-new(root)" },
				);
				tick();
			})
			.catch(finish);

		void reveal.transition.finished.finally(finish);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "d" && e.key !== "D") return;
			const target = e.target as Element;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				(target as HTMLElement).isContentEditable
			)
				return;
			toggleTheme();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [toggleTheme]);

	return (
		<ThemeContext.Provider
			value={{
				theme: pendingTheme ?? theme,
				isThemeTransitioning,
				setTheme,
				toggleTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
