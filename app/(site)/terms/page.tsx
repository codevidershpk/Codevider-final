import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import LegalDocument from "@/components/legal/legal-document";
import LegalHero from "@/components/legal/legal-hero";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";
import "@/app/styles/inner-pages.css";
import "@/app/styles/legal.css";

const TERMS_SECTIONS = [
	"scope",
	"ip",
	"acceptable_use",
	"liability",
	"governing_law",
	"contact",
] as const;

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.terms.title"),
		description: t("metadata.terms.description"),
		page: "terms",
	});
}

export default async function TermsPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<StructuredData
				title={t("metadata.terms.title")}
				description={t("metadata.terms.description")}
				image={getOgImageUrl("terms")}
				url={getPageUrl("/terms")}
			/>
			<LegalHero namespace="legal.terms" />
			<LegalDocument namespace="legal.terms" sections={TERMS_SECTIONS} />
		</div>
	);
}
