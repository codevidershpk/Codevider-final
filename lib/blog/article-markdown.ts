import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/** Single table-of-contents entry derived from a markdown heading. */
export type ArticleTocEntry = {
	id: string;
	label: string;
	level: 1 | 2 | 3;
};

/**
 * Slugifies heading text into a stable DOM id fragment.
 * Shared by the TOC and the ArticleBody heading renderer so TOC links
 * always resolve to the rendered headings.
 */
export function slugifyHeading(text: string): string {
	const slug = text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 64);

	return slug || "section";
}

/** Minimal structural shape of an mdast node (avoids an `any`). */
type MdNode = {
	type: string;
	value?: string;
	alt?: string;
	depth?: number;
	children?: MdNode[];
};

/** Extracts plain text from an mdast subtree for TOC labels. */
function mdastText(node: MdNode): string {
	switch (node.type) {
		case "text":
		case "inlineCode":
		case "math":
		case "inlineMath":
			return typeof node.value === "string" ? node.value : "";
		case "image":
			return typeof node.alt === "string" ? node.alt : "";
		case "html":
			// Raw HTML inside a heading (e.g. `<span>foo</span>`) renders its
			// text content via rehype-raw — keep it so TOC ids match the
			// rendered headings in `ArticleBody`.
			return typeof node.value === "string"
				? node.value.replace(/<[^>]*>/g, "")
				: "";
		case "break":
			return " ";
		default:
			return (node.children ?? []).map(mdastText).join("");
	}
}

/**
 * Walks markdown and returns heading entries for the article TOC.
 * Ids are generated with the same slugger the ArticleBody renderer uses,
 * so TOC anchors resolve to the rendered headings.
 */
export function getArticleTocEntries(markdown: string): ArticleTocEntry[] {
	if (!markdown.trim()) return [];

	let tree;
	try {
		tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
	} catch {
		return [];
	}

	const counts = new Map<string, number>();
	const entries: ArticleTocEntry[] = [];

	visit(tree, "heading", (node) => {
		const heading = node as unknown as MdNode;
		const depth = heading.depth ?? 3;
		const label = mdastText(heading).replace(/\s+/g, " ").trim();
		if (!label) return;

		const base = slugifyHeading(label);
		const seen = counts.get(base) ?? 0;
		counts.set(base, seen + 1);

		entries.push({
			id: `article-${base}${seen > 0 ? `-${seen + 1}` : ""}`,
			label,
			level: depth <= 1 ? 1 : depth === 2 ? 2 : 3,
		});
	});

	return entries;
}
