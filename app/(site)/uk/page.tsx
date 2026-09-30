import type { Metadata } from "next";
import "@/app/styles/uk.css";
import { StructuredData } from "@/components/seo/structured-data";
import { UkContact } from "@/components/uk/uk-contact";
import {
	UkHero,
	UkRescue,
	UkServices,
	UkWhy,
} from "@/components/uk/uk-sections";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";

const TITLE = "Codevider at The Business Show London · Stand B1350";
const DESCRIPTION =
	"Meet Codevider at The Business Show London, 11–12 Nov 2026, ExCeL, Stand B1350. Senior engineers, AI agents, and vibe-code rescue.";

export function generateMetadata(): Metadata {
	return createPageMetadata({
		title: TITLE,
		description: DESCRIPTION,
		path: "/uk",
	});
}

export default function UkPage() {
	return (
		<div className="uk-page">
			<UkHero />
			<UkServices />
			<UkRescue />
			<UkWhy />
			<UkContact />
			<StructuredData
				title={TITLE}
				description={DESCRIPTION}
				image={getOgImageUrl("/uk")}
				url={getPageUrl("/uk")}
			/>
		</div>
	);
}
