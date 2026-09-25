import { Alexandria, Libre_Baskerville } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const alexandria = Alexandria({
	variable: "--font-sans",
	subsets: ["latin"],
	style: ["normal"],
});

const libreBaskerville = Libre_Baskerville({
	variable: "--font-heading",
	subsets: ["latin"],
	weight: ["400", "700"],
	style: ["normal", "italic"],
});

/**
 * Applies the saved (or system) theme before first paint so dark-mode visitors
 * never see a light flash followed by a full-page restyle after hydration.
 * Mirrors the resolution order in ThemeProvider.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

/**
 * On a reload with a saved scroll anchor, hide the page before first paint so
 * the reflow while below-fold sections mount (and the jump back to the saved
 * position) is never visible. HashScrollHandler removes the class and fades
 * the page in; the timeout is a safety net if hydration fails.
 */
const RELOAD_RESTORE_INIT_SCRIPT = `(function(){try{var n=performance.getEntriesByType("navigation")[0];if(!n||n.type!=="reload"||location.hash.length>1)return;var a=JSON.parse(sessionStorage.getItem("reload-scroll-anchor")||"null");if(!a||a.path!==location.pathname)return;history.scrollRestoration="manual";var d=document.documentElement;d.classList.add("reload-restoring");setTimeout(function(){d.classList.remove("reload-restoring")},5000)}catch(e){}})()`;

/** Props for SiteDocument. */
type Props = {
	children: ReactNode;
};

/**
 * Root document component that sets up fonts, theme, and scroll restoration.
 */
export function SiteDocument({ children }: Props) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			suppressHydrationWarning
			className={`${alexandria.variable} ${libreBaskerville.variable} h-full antialiased`}
		>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<script
					dangerouslySetInnerHTML={{ __html: RELOAD_RESTORE_INIT_SCRIPT }}
				/>
				<meta name="apple-mobile-web-app-title" content="Codevider" />
				<meta
					name="google-site-verification"
					content="icvkJSNSGcApy6ogZHuUBc-qCeN1kIXiFF6_7lN74J0"
				/>
			</head>
			<body className="min-h-full flex flex-col" suppressHydrationWarning>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
