"use client";

import { useLayoutEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useCopy } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";

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
	const hitRef = useRef<HTMLButtonElement>(null);

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

	// View Transitions live in the browser top layer and swallow clicks. A
	// transparent popover hit-target is re-stacked above each reveal so the
	// toggle stays interruptible like the "d" shortcut.
	useLayoutEffect(() => {
		const hit = hitRef.current;
		const button = buttonRef.current;
		if (!hit || !button || typeof hit.showPopover !== "function") return;

		if (!isThemeTransitioning) {
			if (hit.matches(":popover-open")) {
				hit.hidePopover();
			}
			return;
		}

		const rect = button.getBoundingClientRect();
		hit.style.top = `${rect.top}px`;
		hit.style.left = `${rect.left}px`;
		hit.style.width = `${rect.width}px`;
		hit.style.height = `${rect.height}px`;

		try {
			if (hit.matches(":popover-open")) {
				hit.hidePopover();
			}
			hit.showPopover();
		} catch {
			/* Popover API unavailable or already open */
		}
	}, [isThemeTransitioning, theme]);

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
			<button
				ref={hitRef}
				type="button"
				popover="manual"
				tabIndex={-1}
				aria-hidden
				className="theme-toggle-hit"
				onPointerDown={(event) => {
					if (event.button !== 0) return;
					event.preventDefault();
					triggerToggle(event.currentTarget);
				}}
			/>
		</div>
	);
}
