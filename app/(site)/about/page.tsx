import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import AboutCulture from "@/components/about/about-culture";
import AboutHero from "@/components/about/about-hero";
import AboutJoinCta from "@/components/about/about-join-cta";
import AboutLifeGrid from "@/components/about/about-life-grid";
import AboutMeetTeam from "@/components/about/about-meet-team";
import AboutWhoWeAre from "@/components/about/about-who-we-are";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";
import "@/app/styles/inner-pages.css";
import "@/app/styles/about.css";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.about.title"),
		description: t("metadata.about.description"),
		path: "/about",
	});
}

export default async function AboutPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<AboutHero />
			<AboutWhoWeAre />
			<AboutCulture />
			<AboutLifeGrid />
			<AboutMeetTeam />
			<AboutJoinCta />
			<StructuredData
				title={t("metadata.about.title")}
				description={t("metadata.about.description")}
				image={getOgImageUrl("/about")}
				url={getPageUrl("/about")}
			/>
		</div>
	);
}
