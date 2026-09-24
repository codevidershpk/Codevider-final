import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import { Suspense } from "react";
import CareerApply from "@/components/career/career-apply";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";
import "@/app/styles/inner-pages.css";
import "@/app/styles/career.css";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.career_apply.title"),
		description: t("metadata.career_apply.description"),
		page: "career",
		path: "/career/apply",
	});
}

export default async function CareerApplyPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<StructuredData
				title={t("metadata.career_apply.title")}
				description={t("metadata.career_apply.description")}
				image={getOgImageUrl("career")}
				url={getPageUrl("/career/apply")}
			/>
			<Suspense>
				<CareerApply />
			</Suspense>
		</div>
	);
}
