"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import {
	Children,
	type ComponentProps,
	isValidElement,
	memo,
	type ReactNode,
	useState,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import MermaidDiagram from "@/components/blog/mermaid-diagram";
import { resolveArticleImageUrl } from "@/lib/blog/article-utils";
import { slugifyHeading } from "@/lib/blog/article-markdown";
import { darkCodeTheme } from "@/lib/code-theme";

const CodeHighlighter = dynamic(
	() => import("@/components/ui/code-highlighter"),
	{ ssr: false },
);

type ArticleBodyProps = {
	/** Raw markdown source from the article API. */
	markdown: string;
};

/**
 * Concatenates rendered heading text (whitespace collapsed) so heading ids
 * match the TOC entries produced by `getArticleTocEntries`.
 * Includes image alt text (mdast includes it for TOC labels) and skips
 * KaTeX's aria-hidden visual duplicate (accessible MathML is kept).
 */
function plainText(children: ReactNode): string {
	let out = "";
	const walk = (node: ReactNode): void => {
		if (node === null || node === undefined || typeof node === "boolean") {
			return;
		}
		if (typeof node === "string" || typeof node === "number") {
			out += String(node);
			return;
		}
		if (Array.isArray(node)) {
			for (const child of node) walk(child);
			return;
		}
		if (isValidElement<{ children?: ReactNode; alt?: string }>(node)) {
			// Heading images render as <img> with no children — use alt text
			// so ids match the mdast-derived TOC labels.
			if (typeof node.type === "string" && node.type.toLowerCase() === "img") {
				if (typeof node.props.alt === "string" && node.props.alt.trim()) {
					out += ` ${node.props.alt} `;
				}
				return;
			}
			// KaTeX renders math twice (accessible MathML + aria-hidden HTML).
			// Skip the hidden visual duplicate so ids stay close to the raw
			// TeX the markdown TOC parser sees.
			const props = node.props as {
				children?: ReactNode;
				alt?: string;
				ariaHidden?: boolean | string;
				["aria-hidden"]?: boolean | string;
			};
			if (
				props["aria-hidden"] === true ||
				props["aria-hidden"] === "true" ||
				props.ariaHidden === true
			) {
				return;
			}
			walk(props.children);
		}
	};
	walk(children);
	return out.replace(/\s+/g, " ").trim();
}

/** Concatenates code text verbatim (whitespace preserved). */
function codeText(children: ReactNode): string {
	let out = "";
	const walk = (node: ReactNode): void => {
		if (node === null || node === undefined || typeof node === "boolean") {
			return;
		}
		if (typeof node === "string" || typeof node === "number") {
			out += String(node);
			return;
		}
		if (Array.isArray(node)) {
			for (const child of node) walk(child);
			return;
		}
		if (isValidElement<{ children?: ReactNode }>(node)) {
			walk(node.props.children);
		}
	};
	walk(children);
	return out;
}

function fallbackCopy(text: string) {
	try {
		const area = document.createElement("textarea");
		area.value = text;
		area.style.position = "fixed";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		document.execCommand("copy");
		area.remove();
	} catch {
		// Clipboard unavailable — still show feedback.
	}
}

/** Normalize fence labels so Prism aliases resolve consistently. */
function normalizeLanguage(raw: string): string {
	const lang = raw.trim().toLowerCase();
	if (!lang) return "text";
	const aliases: Record<string, string> = {
		js: "javascript",
		ts: "typescript",
		py: "python",
		sh: "bash",
		shell: "bash",
		zsh: "bash",
		yml: "yaml",
		html: "markup",
		xml: "markup",
		golang: "go",
		cs: "csharp",
		rb: "ruby",
		gql: "graphql",
		dockerfile: "docker",
		md: "markdown",
	};
	return aliases[lang] ?? lang;
}

/** Code block shell with a language label, copy button, and Prism tokens. */
function CodeBlock({ language, code }: { language: string; code: string }) {
	const [copied, setCopied] = useState(false);
	const label = language.trim() || "code";
	const prismLanguage = normalizeLanguage(language);

	const handleCopy = async () => {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(code);
			} else {
				fallbackCopy(code);
			}
		} catch {
			fallbackCopy(code);
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	};

	return (
		<div className="blog-codeblock">
			<div className="blog-codeblock__bar">
				<span className="blog-codeblock__lang">{label}</span>
				<button
					type="button"
					className={
						copied ? "blog-codeblock__copy is-copied" : "blog-codeblock__copy"
					}
					aria-label={`Copy ${label} code to clipboard`}
					onClick={() => void handleCopy()}
				>
					{copied ? (
						<Check size={14} aria-hidden />
					) : (
						<Copy size={14} aria-hidden />
					)}
					<span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
				</button>
			</div>
			<CodeHighlighter
				language={prismLanguage}
				style={darkCodeTheme}
				className="blog-code"
				customStyle={{
					margin: 0,
					padding: "1rem 1.15rem",
					background: "transparent",
					fontSize: "0.875rem",
					lineHeight: 1.65,
					overflowX: "auto",
				}}
			>
				{code}
			</CodeHighlighter>
		</div>
	);
}

/** Inline images keep the compact styling; standalone ones become figures. */
function BlogImage({
	src,
	alt,
	title,
	className = "blog-img--inline",
}: Pick<ComponentProps<"img">, "src" | "alt" | "title" | "className">) {
	const [failed, setFailed] = useState(false);
	// CRM content may embed bare storage keys (`uploads/...`) or
	// `/local-bucket/...` paths — point those at the backend origin.
	const resolved = resolveArticleImageUrl(src);

	if (!resolved || failed) return null;

	return (
		<img
			src={resolved}
			alt={alt || "Article image"}
			title={title}
			className={className}
			loading="lazy"
			onError={() => setFailed(true)}
		/>
	);
}

/**
 * Renders article markdown (GFM, KaTeX math, raw HTML, mermaid diagrams)
 * into the site's `blog-prose` typography.
 * Content comes from the trusted CRM; raw HTML blocks pass through.
 *
 * Memoized so scroll-driven parent re-renders (TOC / read progress) do not
 * remount markdown images and re-request broken placeholder URLs.
 */
function ArticleBody({ markdown }: ArticleBodyProps) {
	if (!markdown.trim()) return null;

	// Fresh per render so ids stay stable across re-renders and match the TOC.
	// Empty headings get no id (and don't consume a slug) so they stay in
	// sync with `getArticleTocEntries`, which skips them.
	const headingCounts = new Map<string, number>();
	const nextHeadingId = (label: string): string | undefined => {
		const text = label.trim();
		if (!text) return undefined;
		const base = slugifyHeading(text);
		const seen = headingCounts.get(base) ?? 0;
		headingCounts.set(base, seen + 1);
		return `article-${base}${seen > 0 ? `-${seen + 1}` : ""}`;
	};

	const components: Components = {
		h1: ({ children }) => (
			<h2 id={nextHeadingId(plainText(children))} className="blog-h1">
				{children}
			</h2>
		),
		h2: ({ children }) => (
			<h3 id={nextHeadingId(plainText(children))} className="blog-h2">
				{children}
			</h3>
		),
		h3: ({ children }) => (
			<h4 id={nextHeadingId(plainText(children))} className="blog-h3">
				{children}
			</h4>
		),
		h4: ({ children }) => (
			<h4 id={nextHeadingId(plainText(children))} className="blog-h3">
				{children}
			</h4>
		),
		h5: ({ children }) => (
			<h4 id={nextHeadingId(plainText(children))} className="blog-h3">
				{children}
			</h4>
		),
		h6: ({ children }) => (
			<h4 id={nextHeadingId(plainText(children))} className="blog-h3">
				{children}
			</h4>
		),
		p: ({ children }) => {
			// Standalone images become figures (no <p> wrapper).
			const kids = Children.toArray(children);
			const only = kids.length === 1 ? kids[0] : null;
			if (isValidElement(only) && only.type === BlogImage) {
				const props = only.props as Pick<
					ComponentProps<"img">,
					"src" | "alt" | "title"
				>;
				if (!resolveArticleImageUrl(props.src)) return null;
				return (
					<figure className="blog-figure">
						<BlogImage
							src={props.src}
							alt={props.alt}
							title={props.title}
							className="blog-figure__img"
						/>
						{props.title ? (
							<figcaption className="blog-figure__caption">
								{props.title}
							</figcaption>
						) : null}
					</figure>
				);
			}
			return <p className="blog-p">{children}</p>;
		},
		a: ({ href, children }) => {
			const url = href ?? "";
			// Same-document anchors and site-relative links stay in-tab.
			if (
				!url ||
				url.startsWith("#") ||
				(url.startsWith("/") && !url.startsWith("//"))
			) {
				return <a href={url || "#"}>{children}</a>;
			}
			return (
				<a href={url} target="_blank" rel="noopener noreferrer">
					{children}
				</a>
			);
		},
		ul: ({ children, className }) => (
			<ul className={["blog-ul", className].filter(Boolean).join(" ")}>
				{children}
			</ul>
		),
		ol: ({ children, className, start }) => (
			<ol
				className={["blog-ol", className].filter(Boolean).join(" ")}
				start={start}
			>
				{children}
			</ol>
		),
		li: ({ children, className }) => (
			<li className={["blog-li", className].filter(Boolean).join(" ")}>
				{children}
			</li>
		),
		input: ({ checked, type }) => (
			<input
				type={type ?? "checkbox"}
				defaultChecked={checked ?? false}
				disabled
				className="blog-task-check"
				tabIndex={-1}
				aria-hidden="true"
			/>
		),
		img: BlogImage,
		// Blocks render through `code` below; avoid nested <pre> elements.
		pre: ({ children }) => <>{children}</>,
		code: ({ className, children }) => {
			const text = codeText(children);
			const language = /language-([^\s]+)/.exec(className ?? "")?.[1] ?? "";
			const block = language !== "" || text.includes("\n");
			if (!block) {
				return <code className="blog-inline-code">{children}</code>;
			}
			const source = text.replace(/\n$/, "");
			// Mermaid diagrams render client-side into SVG.
			if (language.toLowerCase() === "mermaid") {
				return <MermaidDiagram chart={source} />;
			}
			return <CodeBlock language={language} code={source} />;
		},
		blockquote: ({ children }) => (
			<blockquote className="blog-quote">{children}</blockquote>
		),
		table: ({ children }) => (
			<div className="blog-table-wrap">
				<table className="blog-table">{children}</table>
			</div>
		),
		th: ({ children, style, align }) => (
			<th className="blog-th" style={style} align={align}>
				{children}
			</th>
		),
		td: ({ children, style, align }) => (
			<td className="blog-td" style={style} align={align}>
				{children}
			</td>
		),
		hr: () => <hr className="blog-hr" />,
	};

	return (
		<div className="blog-prose">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[
					rehypeRaw,
					[rehypeKatex, { strict: false, throwOnError: false }],
				]}
				components={components}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	);
}

export default memo(ArticleBody);
