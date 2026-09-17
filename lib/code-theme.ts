import type { CSSProperties } from "react";

/**
 * Dark Prism token theme shared by homepage demos and article code blocks.
 * Tuned for the `#14161d` code canvas used across the site.
 */
export const darkCodeTheme: Record<string, CSSProperties> = {
	'code[class*="language-"]': {
		color: "#e6edf3",
		background: "none",
		fontFamily: "var(--mono)",
		textAlign: "left",
		whiteSpace: "pre",
		wordSpacing: "normal",
		wordBreak: "normal",
		wordWrap: "normal",
	},
	'pre[class*="language-"]': {
		color: "#e6edf3",
		background: "transparent",
		margin: 0,
		padding: 0,
		overflow: "visible",
	},
	comment: { color: "#6b7280", fontStyle: "italic" },
	prolog: { color: "#6b7280" },
	punctuation: { color: "#8b949e" },
	property: { color: "#79c0ff" },
	tag: { color: "#7ee787" },
	boolean: { color: "#ff7b72" },
	number: { color: "#f2cc60" },
	constant: { color: "#79c0ff" },
	symbol: { color: "#f2cc60" },
	selector: { color: "#7ee787" },
	"attr-name": { color: "#79c0ff" },
	string: { color: "#a5d6ff" },
	char: { color: "#a5d6ff" },
	builtin: { color: "#ffa657" },
	operator: { color: "#ff7b72" },
	entity: { color: "#79c0ff" },
	url: { color: "#a5d6ff" },
	variable: { color: "#e6edf3" },
	atrule: { color: "#c792ea" },
	"attr-value": { color: "#a5d6ff" },
	function: { color: "#d2a8ff" },
	"class-name": { color: "#ffa657" },
	keyword: { color: "#ff7b72" },
	regex: { color: "#a5d6ff" },
	important: { color: "#ff7b72", fontWeight: "bold" },
	bold: { fontWeight: "bold" },
	italic: { fontStyle: "italic" },
};
