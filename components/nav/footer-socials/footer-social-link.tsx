import Link from "next/link";
import type { ReactNode } from "react";

type FooterSocialLinkProps = {
	href: string;
	label: string;
	children: ReactNode;
};

export function FooterSocialLink({
	href,
	label,
	children,
}: FooterSocialLinkProps) {
	const isExternal = href.startsWith("http");

	return (
		<Link
			href={href}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			aria-label={label}
			className="footer-social-link grid size-10 place-items-center rounded-(--ui-radius-sm) [&_svg]:size-4"
		>
			{children}
		</Link>
	);
}
