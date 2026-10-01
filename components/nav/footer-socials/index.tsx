import { FacebookSocial } from "./facebook-social";
import { InstagramSocial } from "./instagram-social";
import { LinkedInSocial } from "./linkedin-social";
import { XSocial } from "./x-social";
import { YouTubeSocial } from "./youtube-social";

export function FooterSocials() {
	return (
		<div className="flex flex-wrap gap-2">
			<InstagramSocial />
			<FacebookSocial />
			<LinkedInSocial />
			<XSocial />
			<YouTubeSocial />
		</div>
	);
}
