import { FooterSocialLink } from "./footer-social-link";
import { YouTubeIcon } from "./icons/youtube-icon";

export function YouTubeSocial() {
	return (
		<FooterSocialLink href="https://www.youtube.com/@codevider" label="YouTube">
			<YouTubeIcon className="size-[18px]" />
		</FooterSocialLink>
	);
}
