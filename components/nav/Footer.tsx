"use client";

import { useCopy } from "@/lib/copy";
import Link from "next/link";
import { CodeviderLogo } from "./CodeviderLogo";
import { FooterSocials } from "./footer-socials";

/**
 * Site footer component with company info, links, and socials.
 *
 * @returns Footer component
 */
export default function Footer() {
	const t = useCopy("footer");

	return (
		<footer className="bg-[#0f1424] home-inline-x py-[clamp(54px,7vw,84px)] pb-[96px] navbar:pb-[30px] text-blue-100/70">
			<div className="mx-auto max-w-[1200px]">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
					<div>
						<Link
							href="/"
							aria-label="Home"
							className="inline-flex items-center gap-2.5 -ml-2 text-white"
						>
							<CodeviderLogo />
						</Link>
						<p className="mt-[18px] max-w-[30ch] text-[15px] leading-relaxed">
							{t("description")}
						</p>
					</div>

					<div>
						<h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.04em] text-white">
							{t("company")}
						</h4>
						<Link
							href="/about"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							{t("about")}
						</Link>
						<Link
							href="/services"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							{t("services")}
						</Link>
						<Link
							href="/vibecode-rescue"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							{t("rescue")}
						</Link>
						<Link
							href="/career"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							{t("careers")}
						</Link>
						<Link
							href="/blogs"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							{t("blog")}
						</Link>
					</div>

					<div>
						<h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.04em] text-white">
							{t("address_heading")}
						</h4>
						<p className="py-1.5 text-[15px]">{t("address_line_1")}</p>
						<p className="py-1.5 text-[15px]">{t("address_line_2")}</p>
						<p className="py-1.5 text-[15px]">{t("address_line_3")}</p>
					</div>

					<div>
						<h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.04em] text-white">
							{t("contact_heading")}
						</h4>
						<a
							href="mailto:info@codevider.com"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							info@codevider.com
						</a>
						<a
							href="tel:+35569587742"
							className="block py-1.5 text-[15px] transition-colors hover:text-white"
						>
							+355 69 587 7742
						</a>
					</div>
				</div>

				<div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-white/10 pt-6 text-sm">
					<span suppressHydrationWarning>
						{t("copyright", { year: new Date().getFullYear() })}
					</span>
					<nav
						aria-label="Legal"
						className="flex flex-wrap items-center gap-x-5 gap-y-2"
					>
						<Link
							href="/privacy"
							className="transition-colors hover:text-white"
						>
							{t("privacy")}
						</Link>
						<Link href="/terms" className="transition-colors hover:text-white">
							{t("terms")}
						</Link>
					</nav>
					<FooterSocials />
				</div>
			</div>
		</footer>
	);
}
