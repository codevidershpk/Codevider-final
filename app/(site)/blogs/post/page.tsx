import type { Metadata } from "next";
import { getCopy } from "@/lib/copy";
import { Suspense } from "react";
import BlogPost from "@/components/blog/blog-post";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, getOgImageUrl, getPageUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
	const t = getCopy();

	return createPageMetadata({
		title: t("metadata.blog_post.title"),
		description: t("metadata.blog_post.description"),
		page: "blog",
		path: "/blogs/post",
	});
}

export default async function BlogPostPage() {
	const t = getCopy();

	return (
		<div className="home-page">
			<StructuredData
				title={t("metadata.blog_post.title")}
				description={t("metadata.blog_post.description")}
				image={getOgImageUrl("blog")}
				url={getPageUrl("/blogs/post")}
			/>
			<Suspense>
				<BlogPost />
			</Suspense>
		</div>
	);
}
