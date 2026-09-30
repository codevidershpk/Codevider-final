import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import Hero from "@/components/index/hero";
import {
	Contact,
	CoreServices,
	Faq,
	GlobalPartnerships,
	WhoWeAre,
	WhoWeEmpower,
	WhyChooseUs,
} from "@/components/index/home-below-fold";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.home.title"),
		description: t("metadata.home.description"),
		path: "",
	});
}

export default async function Home() {
	const t = getCopy();

	return (
		<div className="home-page">
			<Hero />
			<WhoWeAre />
			<CoreServices />
			<WhoWeEmpower />
			<WhyChooseUs />
			<GlobalPartnerships />
			<Faq />
			<Contact />
			<StructuredData
				title={t("metadata.home.title")}
				description={t("metadata.home.description")}
				image={getOgImageUrl("")}
				url={getPageUrl("")}
			/>
		</div>
	);
}
