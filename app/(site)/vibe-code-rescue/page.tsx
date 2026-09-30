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
import { createPageMetadata } from "@/lib/site";
import "@/app/styles/vibecode-rescue.css";

const TITLE = "Vibe-Code Rescue | Codevider";
const DESCRIPTION =
	"We step into AI-built apps that have become hard to change, and get the product moving again.";

export function generateMetadata(): Metadata {
	return {
		...createPageMetadata({
			title: TITLE,
			description: DESCRIPTION,
			page: "services",
			path: "/vibe-code-rescue",
		}),
		robots: {
			index: false,
			follow: false,
		},
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
		</div>
	);
}
