import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import CareerHero from "@/components/career/career-hero";
import CareerHiringProcess from "@/components/career/career-hiring-process";
import CareerOpenings from "@/components/career/career-openings";
import CareerWhyJoin from "@/components/career/career-why-join";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";
import "@/app/styles/inner-pages.css";
import "@/app/styles/career.css";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.career.title"),
		description: t("metadata.career.description"),
		page: "career",
	});
}

export default async function CareerPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<StructuredData
				title={t("metadata.career.title")}
				description={t("metadata.career.description")}
				image={getOgImageUrl("career")}
				url={getPageUrl("/career")}
			/>
			<CareerHero />
			<CareerOpenings />
			<CareerWhyJoin />
			<CareerHiringProcess />
		</div>
	);
}
