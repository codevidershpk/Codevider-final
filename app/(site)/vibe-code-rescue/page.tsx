import type { Metadata } from "next";
import Contact from "@/components/index/contact";
import { RescueHero } from "@/components/vibecode-rescue/rescue-hero";
import {
	RescueAfter,
	RescueArrival,
	RescueClose,
	RescueKeep,
	RescueProcess,
	RescueReality,
	RescueSituations,
	RescueStack,
} from "@/components/vibecode-rescue/rescue-sections";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";
import "@/app/styles/vibecode-rescue.css";

const PATH = "/vibe-code-rescue";
const TITLE = "Vibe-Code Rescue: Fix Your AI-Built App | Codevider";
const DESCRIPTION =
	"Built with Lovable, Bolt, Cursor, Replit or v0 and now stuck? Senior engineers audit, stabilise and ship your AI-generated app to production.";

export function generateMetadata(): Metadata {
	return {
		...createPageMetadata({
			title: TITLE,
			description: DESCRIPTION,
			path: PATH,
		}),
		keywords: [
			"vibe coding",
			"vibe-code rescue",
			"fix AI-generated code",
			"AI app to production",
			"Lovable developer",
			"Bolt developer",
			"Cursor",
			"code audit",
			"technical debt",
		],
	};
}

export default function VibeCodeRescuePage() {
	return (
		<div className="vcr-page">
			<RescueHero />
			<RescueReality />
			<RescueSituations />
			<RescueArrival />
			<RescueProcess />
			<RescueStack />
			<RescueKeep />
			<RescueAfter />
			<RescueClose />
			<div id="contact">
				<Contact
					hideIntro
					messagePlaceholder="The app, what’s breaking, and where you’re stuck."
				/>
			</div>
			<StructuredData
				title={TITLE}
				description={DESCRIPTION}
				image={getOgImageUrl(PATH)}
				url={getPageUrl(PATH)}
			/>
		</div>
	);
}
