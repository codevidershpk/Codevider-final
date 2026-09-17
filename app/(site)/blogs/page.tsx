import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import BlogHero from "@/components/blog/blog-hero";
import BlogList from "@/components/blog/blog-list";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.blog.title"),
		description: t("metadata.blog.description"),
		page: "blog",
	});
}

export default async function BlogPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<StructuredData
				title={t("metadata.blog.title")}
				description={t("metadata.blog.description")}
				image={getOgImageUrl("blog")}
				url={getPageUrl("/blogs")}
			/>
			<BlogHero />
			<BlogList />
		</div>
	);
}
