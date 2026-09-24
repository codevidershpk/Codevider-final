"use client";

import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { getTurnstileSiteKey } from "@/lib/turnstile";

type TurnstileRenderOptions = {
	sitekey: string;
	size?: "normal" | "compact" | "flexible";
	appearance?: "always" | "execute" | "interaction-only";
	callback?: (token: string) => void;
	"expired-callback"?: () => void;
	"error-callback"?: () => void;
};

type TurnstileApi = {
	render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
	reset: (widgetId: string) => void;
	remove: (widgetId: string) => void;
};

type TurnstileWindow = Window & {
	turnstile?: TurnstileApi;
};

const TURNSTILE_SCRIPT_SRC =
	"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
	if (typeof window === "undefined") {
		return Promise.resolve();
	}

	const win = window as TurnstileWindow;
	if (win.turnstile) {
		return Promise.resolve();
	}

	if (turnstileScriptPromise) {
		return turnstileScriptPromise;
	}

	turnstileScriptPromise = new Promise((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>(
			'script[src*="challenges.cloudflare.com/turnstile"]',
		);

		if (existing) {
			if (win.turnstile) {
				resolve();
				return;
			}

			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener(
				"error",
				() => reject(new Error("Failed to load Turnstile")),
				{ once: true },
			);
			return;
		}

		const script = document.createElement("script");
		script.src = TURNSTILE_SCRIPT_SRC;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Turnstile"));
		document.head.appendChild(script);
	});

	return turnstileScriptPromise;
}

function removeWidget(widgetId: string | null) {
	if (!widgetId) return;

	const win = window as TurnstileWindow;
	if (!win.turnstile) return;

	try {
		win.turnstile.remove(widgetId);
	} catch {
		// Widget may already be gone after navigation or strict-mode remount.
	}
}

export type TurnstileWidgetHandle = {
	reset: () => void;
};

type TurnstileWidgetProps = {
	onTokenChange: (token: string | null) => void;
	/**
	 * Message shown when the Turnstile script fails to load (ad-blocker,
	 * network issue, bad site key). Without this the forms stay
	 * unsubmittable with no explanation.
	 */
	errorMessage?: string;
};

export const TurnstileWidget = forwardRef<
	TurnstileWidgetHandle,
	TurnstileWidgetProps
>(function TurnstileWidget({ onTokenChange, errorMessage }, ref) {
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);
	const onTokenChangeRef = useRef(onTokenChange);
	const [loadFailed, setLoadFailed] = useState(false);

	onTokenChangeRef.current = onTokenChange;

	useEffect(() => {
		let cancelled = false;

		const renderWidget = () => {
			const win = window as TurnstileWindow;
			const container = containerRef.current;

			if (!win.turnstile || !container || cancelled) {
				return;
			}

			removeWidget(widgetIdRef.current);
			widgetIdRef.current = null;
			container.replaceChildren();

			widgetIdRef.current = win.turnstile.render(container, {
				sitekey: getTurnstileSiteKey(),
				size: "flexible",
				appearance: "interaction-only",
				callback: (token) => {
					onTokenChangeRef.current(token);
				},
				"expired-callback": () => {
					onTokenChangeRef.current(null);
				},
				"error-callback": () => {
					onTokenChangeRef.current(null);
				},
			});
		};

		loadTurnstileScript()
			.then(() => {
				if (!cancelled) {
					renderWidget();
				}
			})
			.catch(() => {
				if (!cancelled) {
					setLoadFailed(true);
				}
				onTokenChangeRef.current(null);
			});

		return () => {
			cancelled = true;
			removeWidget(widgetIdRef.current);
			widgetIdRef.current = null;
		};
	}, []);

	useImperativeHandle(ref, () => ({
		reset: () => {
			const win = window as TurnstileWindow;
			if (win.turnstile && widgetIdRef.current) {
				win.turnstile.reset(widgetIdRef.current);
			}
			onTokenChangeRef.current(null);
		},
	}));

	return (
		<>
			<div ref={containerRef} className="w-full min-w-0" />
			{loadFailed && errorMessage ? (
				<p className="mt-1.5 text-sm text-(--dash-warning)" role="alert">
					{errorMessage}
				</p>
			) : null}
		</>
	);
});
