import type { ReactNode } from "react";
import { SiteDocument } from "@/components/layout/site-document";

/**
 * True root layout — required so global not-found and route-group pages
 * share one `<html>` / `<body>` and avoid DefaultLayout hydration mismatches.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
	return <SiteDocument>{children}</SiteDocument>;
}
