import { FooterSocialLink } from "./footer-social-link";
import { XIcon } from "./icons/x-icon";

export function XSocial() {
	return (
		<FooterSocialLink href="https://x.com/codevider" label="X">
			<XIcon className="size-[16px]" />
		</FooterSocialLink>
	);
}
