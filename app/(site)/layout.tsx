import type { Metadata } from "next";
import { HashScrollHandler } from "@/components/layout/hash-scroll-handler";
import Footer from "@/components/nav/Footer";
import { Navbar } from "@/components/nav/Navbar";
import { getCopy } from "@/lib/copy";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
		? {
				verification: {
					google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
				},
			}
		: {}),
};

export default function SiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const t = getCopy();

	return (
		<>
			<a href="#main-content" className="skip-link">
				{t("navbar.skip_to_content")}
			</a>
			<Navbar />
			<HashScrollHandler />
			<div id="root" className="flex flex-1 flex-col">
				<main id="main-content" tabIndex={-1} className="flex-1 outline-none">
					{children}
				</main>
				<Footer />
			</div>
		</>
	);
}
