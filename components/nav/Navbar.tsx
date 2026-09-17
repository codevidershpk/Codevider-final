"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CodeviderLogo } from "./CodeviderLogo";
import { ThemeToggle } from "./ThemeToggle";

const SCROLL_ON = 56;
const HIDE_THRESHOLD = 200;
const NAV_FLOAT_INSET = 12;

type NavAppearance = "dark" | "light";

const navScrollTransition = {
	duration: 0.5,
	ease: [0.22, 1, 0.36, 1] as const,
};

const instantTransition = { duration: 0 };

/**
 * Gets CSS class for nav shell styling.
 *
 * @param appearance - Nav appearance (dark/light)
 * @param isScrolled - Whether user has scrolled past threshold
 * @returns CSS class string
 */
function navShellClass(appearance: NavAppearance, isScrolled: boolean): string {
	if (appearance === "dark") {
		return isScrolled ? "nav-shell--scrolled-dark" : "nav-shell--surface-dark";
	}
	return isScrolled ? "nav-shell--scrolled-light" : "nav-shell--surface-light";
}

/**
 * Determines nav appearance based on current theme.
 *
 * @param theme - Current theme (light/dark)
 * @returns Nav appearance
 */
function getNavAppearance(theme: "light" | "dark"): NavAppearance {
	return theme === "dark" ? "light" : "dark";
}

const navTransition = navScrollTransition;

const navPillSpring = {
	type: "spring" as const,
	stiffness: 420,
	damping: 38,
	mass: 0.7,
};

const navLinks = [
	{ href: "/", key: "home" as const },
	{ href: "/services", key: "services" as const },
	{ href: "/blogs", key: "blog" as const },
	{ href: "/career", key: "career" as const },
	{ href: "/about", key: "about" as const },
];

function isNavLinkActive(pathname: string, href: string): boolean {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigation link component with active state styling.
 */
function NavLink({
	href,
	label,
	isActive,
	isHot,
	onClick,
	onFocus,
	onBlur,
	className = "",
	linkRef,
	appearance = "dark",
}: {
	href: string;
	label: string;
	isActive: boolean;
	isHot?: boolean;
	onClick?: () => void;
	onFocus?: () => void;
	onBlur?: () => void;
	className?: string;
	linkRef?: (node: HTMLAnchorElement | null) => void;
	appearance?: NavAppearance;
}) {
	const isDarkNav = appearance === "dark";
	const emphasized = isActive || isHot;

	return (
		<Link
			ref={linkRef}
			href={href}
			onClick={onClick}
			onFocus={onFocus}
			onBlur={onBlur}
			className={`relative z-10 rounded-full px-3 py-1.5 text-sm font-medium transition-colors active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) ${
				emphasized
					? isDarkNav
						? "text-white"
						: "text-slate-900"
					: isDarkNav
						? "text-slate-300"
						: "text-slate-600"
			} ${className}`}
		>
			{label}
		</Link>
	);
}

/**
 * Desktop navigation links with a fluid sliding hover/active pill.
 */
function DesktopNavLinks({ appearance }: { appearance: NavAppearance }) {
	const t = useCopy("navbar");
	const pathname = usePathname();
	const shouldReduceMotion = useReducedMotion();
	const listRef = useRef<HTMLDivElement>(null);
	const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
	const [hoveredHref, setHoveredHref] = useState<string | null>(null);
	const [pill, setPill] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		ready: false,
	});

	const activeHref =
		navLinks.find(({ href }) => isNavLinkActive(pathname, href))?.href ?? null;
	const highlightHref = hoveredHref ?? activeHref;
	const isDarkNav = appearance === "dark";

	const syncPill = useCallback((href: string | null) => {
		const list = listRef.current;
		if (!list || !href) {
			setPill((prev) => ({ ...prev, ready: false }));
			return;
		}

		const link = linkRefs.current.get(href);
		if (!link) {
			setPill((prev) => ({ ...prev, ready: false }));
			return;
		}

		const listRect = list.getBoundingClientRect();
		const linkRect = link.getBoundingClientRect();

		setPill({
			x: linkRect.left - listRect.left,
			y: linkRect.top - listRect.top,
			width: linkRect.width,
			height: linkRect.height,
			ready: true,
		});
	}, []);

	useEffect(() => {
		syncPill(highlightHref);

		const list = listRef.current;
		if (!list) return;

		const observer = new ResizeObserver(() => {
			syncPill(highlightHref);
		});
		observer.observe(list);

		return () => observer.disconnect();
	}, [highlightHref, appearance, pathname, syncPill]);

	const setLinkRef = useCallback(
		(href: string, node: HTMLAnchorElement | null) => {
			if (node) linkRefs.current.set(href, node);
			else linkRefs.current.delete(href);
		},
		[],
	);

	const pickNearestHref = (clientX: number) => {
		let nearestHref: string | null = null;
		let nearestDistance = Number.POSITIVE_INFINITY;

		for (const { href } of navLinks) {
			const link = linkRefs.current.get(href);
			if (!link) continue;

			const rect = link.getBoundingClientRect();
			const center = rect.left + rect.width / 2;
			const distance = Math.abs(center - clientX);
			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearestHref = href;
			}
		}

		return nearestHref;
	};

	return (
		<div
			ref={listRef}
			className="relative isolate hidden items-center justify-center gap-1 navbar:flex"
			onPointerLeave={() => setHoveredHref(null)}
			onPointerMove={(event) => {
				if (event.pointerType === "touch") return;
				const nextHref = pickNearestHref(event.clientX);
				if (nextHref && nextHref !== hoveredHref) {
					setHoveredHref(nextHref);
				}
			}}
		>
			{pill.ready ? (
				<motion.span
					className={`pointer-events-none absolute top-0 left-0 z-0 rounded-full ${
						isDarkNav ? "bg-white/12" : "bg-slate-900/8"
					}`}
					aria-hidden
					initial={false}
					animate={{
						x: pill.x,
						y: pill.y,
						width: pill.width,
						height: pill.height,
						opacity: 1,
					}}
					transition={shouldReduceMotion ? { duration: 0 } : navPillSpring}
				/>
			) : null}

			{navLinks.map(({ href, key }) => {
				const isActive = isNavLinkActive(pathname, href);
				const isHot = highlightHref === href;

				return (
					<NavLink
						key={href}
						href={href}
						label={t(key)}
						isActive={isActive && !hoveredHref}
						isHot={isHot}
						appearance={appearance}
						linkRef={(node) => setLinkRef(href, node)}
						onFocus={() => setHoveredHref(href)}
						onBlur={() => setHoveredHref(null)}
					/>
				);
			})}
		</div>
	);
}

/**
 * Main navbar component with desktop/mobile views and scroll state handling.
 *
 * @returns Navbar component
 */
export function Navbar() {
	const t = useCopy("navbar");
	const pathname = usePathname();
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const shouldReduceMotion = useReducedMotion();
	const [isScrolled, setIsScrolled] = useState(false);
	const isScrolledRef = useRef(false);
	const [isHidden, setIsHidden] = useState(false);
	const lastScrollYRef = useRef(0);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const initializedRef = useRef(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const navAppearance = mounted ? getNavAppearance(theme) : "dark";
	const isDarkNav = navAppearance === "dark";
	// SSR and the first client render must share the same value — reading
	// window.innerWidth in useState causes a hydration mismatch.
	const [viewportWidth, setViewportWidth] = useState(1300);

	useLayoutEffect(() => {
		const syncWidth = () => setViewportWidth(window.innerWidth);
		syncWidth();
		window.addEventListener("resize", syncWidth);
		return () => window.removeEventListener("resize", syncWidth);
	}, []);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const onScroll = () => {
			const scrollY = window.scrollY;
			const delta = scrollY - lastScrollYRef.current;
			lastScrollYRef.current = scrollY;

			// Auto-hide: only after HIDE_THRESHOLD so morph completes first
			if (scrollY <= SCROLL_ON) {
				setIsHidden(false);
			} else if (scrollY > HIDE_THRESHOLD && delta > 0) {
				setIsHidden(true);
			} else if (delta < 0) {
				setIsHidden(false);
			}

			const nextIsScrolled = scrollY > SCROLL_ON;
			if (nextIsScrolled !== isScrolledRef.current) {
				isScrolledRef.current = nextIsScrolled;
				setIsScrolled(nextIsScrolled);
			}
		};

		if (!initializedRef.current) {
			const scrollY = window.scrollY;
			lastScrollYRef.current = scrollY;
			const initialIsScrolled = scrollY > SCROLL_ON;
			isScrolledRef.current = initialIsScrolled;
			setIsScrolled(initialIsScrolled);
			initializedRef.current = true;

			requestAnimationFrame(() => {
				setShouldAnimate(true);
			});
		}

		const timer = setTimeout(() => {
			onScroll();
		}, 50);

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			clearTimeout(timer);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	useEffect(() => {
		if (!pathname) return;
		setMobileMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 936px)");

		const handleViewportChange = (event: MediaQueryListEvent) => {
			if (event.matches) setMobileMenuOpen(false);
		};

		mediaQuery.addEventListener("change", handleViewportChange);
		return () => mediaQuery.removeEventListener("change", handleViewportChange);
	}, []);

	useEffect(() => {
		if (isHidden) setMobileMenuOpen(false);
	}, [isHidden]);

	useEffect(() => {
		if (!mobileMenuOpen) return;

		const previousOverflow = document.body.style.overflow;
		const root = document.getElementById("root");
		document.body.style.overflow = "hidden";
		root?.setAttribute("inert", "");

		const focusTimer = window.requestAnimationFrame(() => {
			closeButtonRef.current?.focus();
		});

		const getFocusable = () => {
			const rootEl = mobileMenuRef.current;
			if (!rootEl) return [] as HTMLElement[];
			return Array.from(
				rootEl.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMobileMenuOpen(false);
				return;
			}
			if (event.key !== "Tab") return;

			const focusable = getFocusable();
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			window.cancelAnimationFrame(focusTimer);
			document.body.style.overflow = previousOverflow;
			root?.removeAttribute("inert");
			document.removeEventListener("keydown", handleKeyDown);
			menuButtonRef.current?.focus();
		};
	}, [mobileMenuOpen]);

	const closeMobileMenu = () => setMobileMenuOpen(false);

	return (
		<>
			<div
				className="fixed inset-x-0 top-0 z-50"
				data-navbar
				style={{
					transform: isHidden ? "translateY(-115%)" : undefined,
					transition:
						shouldReduceMotion || !shouldAnimate
							? "none"
							: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
				}}
			>
				<motion.div
					initial={false}
					className="backdrop-blur-[2px]"
					animate={{
						paddingTop: isScrolled ? 10 : 0,
						paddingLeft: isScrolled ? NAV_FLOAT_INSET : 0,
						paddingRight: isScrolled ? NAV_FLOAT_INSET : 0,
					}}
					transition={
						shouldReduceMotion || !shouldAnimate
							? instantTransition
							: navTransition
					}
				>
					<motion.nav
						aria-label="Main navigation"
						className={`mx-auto w-full border border-transparent ${mounted ? navShellClass(navAppearance, isScrolled) : ""}`}
						initial={false}
						animate={{
							height: isScrolled ? 60 : 72,
							borderRadius: isScrolled ? 20 : 0,
							// Animate from the live viewport width (not a huge
							// constant like 10000) so x shrinks on the same
							// clock as y — otherwise width stays pinned full
							// until maxWidth drops below the viewport at the
							// tail of the tween, reading as "y then x".
							maxWidth: isScrolled ? 1300 : viewportWidth,
						}}
						transition={
							shouldReduceMotion || !shouldAnimate
								? instantTransition
								: navTransition
						}
					>
						<div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4 px-4">
							<Link
								href="/"
								aria-label="Codevider"
								className="shrink-0 transition-opacity hover:opacity-90 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
							>
								<CodeviderLogo
									compact={false}
									variant={navAppearance}
									stableLayout
								/>
							</Link>

							<DesktopNavLinks appearance={navAppearance} />

							<div className="flex shrink-0 items-center justify-end gap-2.5">
								<ThemeToggle variant={navAppearance} />

								<button
									ref={menuButtonRef}
									type="button"
									className={`grid size-10 place-items-center rounded-full border transition-[background-color,color,border-color] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) navbar:hidden ${
										isDarkNav
											? "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
											: "border-slate-200 bg-slate-900/5 text-slate-900 hover:border-slate-300 hover:bg-slate-900/10"
									}`}
									aria-expanded={mobileMenuOpen}
									aria-controls="mobile-nav-menu"
									aria-label={t("open_menu")}
									onClick={() => setMobileMenuOpen(true)}
								>
									<Menu className="size-[18px]" aria-hidden />
								</button>
							</div>
						</div>
					</motion.nav>
				</motion.div>
			</div>

			<AnimatePresence>
				{mobileMenuOpen ? (
					<motion.div
						ref={mobileMenuRef}
						id="mobile-nav-menu"
						role="dialog"
						aria-modal="true"
						aria-label={t("mobile_menu")}
						className="mobile-nav-overlay fixed inset-0 z-[60] overscroll-contain navbar:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={
							shouldReduceMotion ? instantTransition : { duration: 0.25 }
						}
					>
						<div
							className="pattern-grid mobile-nav-overlay__grid absolute inset-0"
							aria-hidden
						/>
						<div className="relative flex h-full flex-col px-6">
							<div className="flex h-[72px] items-center justify-between">
								<Link
									href="/"
									aria-label="Codevider"
									className="shrink-0 transition-opacity hover:opacity-90 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
									onClick={closeMobileMenu}
								>
									<CodeviderLogo
										compact={false}
										variant={theme === "dark" ? "dark" : "light"}
										stableLayout
									/>
								</Link>
								<button
									ref={closeButtonRef}
									type="button"
									onClick={closeMobileMenu}
									aria-label={t("close_menu")}
									className="mobile-nav-overlay__close grid size-10 place-items-center rounded-full active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
								>
									<X className="size-[18px]" aria-hidden />
								</button>
							</div>

							<nav
								aria-label="Mobile navigation"
								className="mt-10 flex flex-col gap-2"
							>
								{navLinks.map(({ href, key }, index) => (
									<motion.div
										key={href}
										initial={
											shouldReduceMotion ? false : { opacity: 0, x: -24 }
										}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											delay: shouldReduceMotion ? 0 : 0.08 + index * 0.06,
											duration: shouldReduceMotion ? 0 : 0.45,
											ease: [0.22, 1, 0.36, 1],
										}}
									>
										<Link
											href={href}
											onClick={closeMobileMenu}
											data-active={isNavLinkActive(pathname, href)}
											className="mobile-nav-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
										>
											{t(key)}
											<ArrowUpRight
												className="mobile-nav-link__icon size-[22px]"
												aria-hidden
											/>
										</Link>
									</motion.div>
								))}
							</nav>

							<motion.div
								className="mt-auto mb-10"
								initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: shouldReduceMotion ? 0 : 0.36,
									duration: shouldReduceMotion ? 0 : 0.45,
									ease: [0.22, 1, 0.36, 1],
								}}
							>
								<Link
									href="https://calendly.com/codevider/pasho"
									onClick={closeMobileMenu}
									className="home-brand-btn inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-base"
								>
									{t("book_a_call")}
									<ArrowUpRight className="size-[18px] shrink-0" aria-hidden />
								</Link>
							</motion.div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			<Link
				href="https://calendly.com/codevider/pasho"
				className={`home-brand-btn home-brand-btn--shine gap-2 fixed bottom-6 right-6 z-50 px-5 py-3 navbar:hidden transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
				aria-label={t("book_a_call")}
				aria-hidden={mobileMenuOpen || undefined}
				tabIndex={mobileMenuOpen ? -1 : undefined}
			>
				{t("book_a_call")}
				<ArrowUpRight className="size-4 shrink-0" aria-hidden />
			</Link>
		</>
	);
}
