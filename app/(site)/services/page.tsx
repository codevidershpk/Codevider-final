import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import { StructuredData } from "@/components/seo/structured-data";
import ServicesCapabilities from "@/components/services/services-capabilities";
import ServicesHero from "@/components/services/services-hero";
import ServicesProcess from "@/components/services/services-process";
import ServicesTechStack from "@/components/services/services-tech-stack";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";
import "@/app/styles/inner-pages.css";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.services.title"),
		description: t("metadata.services.description"),
		path: "/services",
	});
}

export default async function ServicesPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<ServicesHero />
			<ServicesCapabilities />
			<ServicesProcess />
			<ServicesTechStack />
			<StructuredData
				title={t("metadata.services.title")}
				description={t("metadata.services.description")}
				image={getOgImageUrl("/services")}
				url={getPageUrl("/services")}
			/>
		</div>
	);
}
