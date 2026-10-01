"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCopy } from "@/lib/copy";

type ThemeToggleProps = {
	variant?: "light" | "dark";
	fullWidth?: boolean;
	className?: string;
};

export function ThemeToggle({
	variant = "light",
	fullWidth = false,
	className = "",
}: ThemeToggleProps) {
	const { theme, isThemeTransitioning, toggleTheme } = useTheme();
	const t = useCopy("navbar");
	const isDark = theme === "dark";
	const modeLabel = isDark ? t("light_mode") : t("dark_mode");
	const buttonRef = useRef<HTMLButtonElement>(null);

	const buttonClasses = `relative flex cursor-pointer items-center rounded-full border active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) ${
		fullWidth
			? "min-w-0 w-full flex-1 justify-start gap-2 px-4 py-2.5"
			: "size-10 justify-center"
	} ${
		variant === "dark"
			? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
			: "border-slate-200 bg-slate-900/5 text-slate-600 hover:bg-slate-900/10 hover:text-slate-900"
	} ${className}`;

	const triggerToggle = (el: HTMLElement) => {
		const rect = el.getBoundingClientRect();
		toggleTheme({
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		});
	};

	// The View Transition overlay swallows hit-testing, so the button can't
	// receive clicks or show its cursor mid-reveal. Hit-test it by coordinates
	// at the window level instead, keeping the toggle interruptible like "d".
	// biome-ignore lint/correctness/useExhaustiveDependencies: triggerToggle only reads stable refs/callbacks
	useEffect(() => {
		const button = buttonRef.current;
		if (!isThemeTransitioning || !button) return;

		const root = document.documentElement;
		const isOverButton = (event: PointerEvent) => {
			const rect = button.getBoundingClientRect();
			return (
				rect.width > 0 &&
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom
			);
		};

		const handlePointerMove = (event: PointerEvent) => {
			root.style.cursor = isOverButton(event) ? "pointer" : "";
		};

		const handlePointerDown = (event: PointerEvent) => {
			if (event.button !== 0) return;
			// Let the button's own handler run if the event reached it.
			if (button.contains(event.target as Node)) return;
			if (!isOverButton(event)) return;
			event.preventDefault();
			event.stopPropagation();
			triggerToggle(button);
		};

		window.addEventListener("pointermove", handlePointerMove, true);
		window.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			window.removeEventListener("pointermove", handlePointerMove, true);
			window.removeEventListener("pointerdown", handlePointerDown, true);
			root.style.cursor = "";
		};
	}, [isThemeTransitioning]);

	return (
		<div className={fullWidth ? "min-w-0 flex-1" : ""}>
			<button
				ref={buttonRef}
				type="button"
				onPointerDown={(event) => {
					if (event.button !== 0) return;
					event.preventDefault();
					triggerToggle(event.currentTarget);
				}}
				aria-label={
					isDark ? t("switch_to_light_mode") : t("switch_to_dark_mode")
				}
				className={buttonClasses}
			>
				<span
					className={`flex items-center gap-2 ${
						fullWidth ? "min-w-0 truncate text-sm font-medium" : ""
					}`}
				>
					<span
						className="flex shrink-0 items-center justify-center"
						aria-hidden
					>
						{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
					</span>
					{fullWidth ? <span className="truncate">{modeLabel}</span> : null}
				</span>
			</button>
		</div>
	);
}
