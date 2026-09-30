import type { MetadataRoute } from "next";
import { getPageUrl, SITE_ROUTES } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	return SITE_ROUTES.map((path) => ({
		url: getPageUrl(path),
		lastModified: new Date(),
		changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
		priority: path === "" ? 1 : 0.8,
	}));
}
