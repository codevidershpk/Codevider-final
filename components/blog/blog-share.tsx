"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCopy } from "@/lib/copy";
import { FacebookIcon } from "@/components/nav/footer-socials/icons/facebook-icon";
import { LinkedInIcon } from "@/components/nav/footer-socials/icons/linkedin-icon";
import type { SVGProps } from "react";

function XIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="currentColor"
			aria-hidden
			{...props}
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
		</svg>
	);
}

function fallbackCopy(text: string) {
	try {
		const area = document.createElement("textarea");
		area.value = text;
		area.style.position = "fixed";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		document.execCommand("copy");
		area.remove();
	} catch {
		// Clipboard unavailable — still show feedback.
	}
}

type BlogShareProps = {
	/** Article title used in the share message. */
	title: string;
};

/**
 * Share row rendered at the end of an article. Facebook, X and LinkedIn
 * open their share intents; the copy button copies the share message plus
 * link for pasting anywhere (messengers, Instagram, email…).
 */
export default function BlogShare({ title }: BlogShareProps) {
	const t = useCopy("blog.post");
	// Client component, so `window` is available on first render. The heading
	// hash is stripped so shares land on the article top.
	const [pageUrl] = useState(() =>
		typeof window === "undefined" ? "" : window.location.href.split("#")[0],
	);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 1600);
		return () => window.clearTimeout(timer);
	}, [copied]);

	const encodedUrl = encodeURIComponent(pageUrl);
	const shareText = t("share_message", { title });
	const encodedText = encodeURIComponent(shareText);

	const targets = [
		{
			id: "facebook",
			label: t("share_facebook"),
			href: pageUrl
				? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
				: undefined,
			Icon: FacebookIcon,
		},
		{
			id: "x",
			label: t("share_x"),
			href: pageUrl
				? `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
				: undefined,
			Icon: XIcon,
		},
		{
			// LinkedIn's share-offsite endpoint only accepts a URL — it pulls
			// the title/description from the page's Open Graph metadata.
			id: "linkedin",
			label: t("share_linkedin"),
			href: pageUrl
				? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
				: undefined,
			Icon: LinkedInIcon,
		},
	];

	const handleCopy = async () => {
		if (!pageUrl) return;
		const message = `${shareText} ${pageUrl}`;
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(message);
			} else {
				fallbackCopy(message);
			}
		} catch {
			fallbackCopy(message);
		}
		setCopied(true);
	};

	return (
		<section className="blog-share" aria-label={t("share_label")}>
			<div className="blog-share__row">
				<p className="blog-share__label">{t("share_label")}</p>
				<p className="blog-share__hint">{t("share_hint")}</p>
			</div>
			<ul className="blog-share__list">
				{targets.map(({ id, label, href, Icon }) => (
					<li key={id}>
						<a
							className="blog-share__btn"
							href={href ?? "#"}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={label}
							aria-disabled={!pageUrl || undefined}
							tabIndex={!pageUrl ? -1 : undefined}
							onClick={(event) => {
								if (!pageUrl) event.preventDefault();
							}}
						>
							<Icon className="size-4" />
							<span aria-hidden="true">{t(`share_${id}_short`)}</span>
						</a>
					</li>
				))}
				<li>
					<button
						type="button"
						className={copied ? "blog-share__btn is-copied" : "blog-share__btn"}
						aria-label={copied ? t("share_copied") : t("share_copy")}
						aria-live="polite"
						disabled={!pageUrl}
						onClick={() => void handleCopy()}
					>
						{copied ? (
							<Check size={16} aria-hidden />
						) : (
							<Link2 size={16} aria-hidden />
						)}
						<span aria-hidden="true">
							{copied ? t("share_copied_short") : t("share_copy_short")}
						</span>
					</button>
				</li>
			</ul>
		</section>
	);
}
