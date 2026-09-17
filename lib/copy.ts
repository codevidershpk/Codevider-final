import messages from "@/dictionaries/en.json";

type MessageTree = Record<string, unknown>;
type Values = Record<
	string,
	string | number | boolean | Date | null | undefined
>;

function getAtPath(tree: unknown, path: string): unknown {
	if (!path) return tree;

	let current: unknown = tree;
	for (const segment of path.split(".")) {
		if (
			current === null ||
			current === undefined ||
			typeof current !== "object"
		) {
			return undefined;
		}
		current = (current as MessageTree)[segment];
	}
	return current;
}

function formatCopyValue(
	value: Values[string],
	style?: "number",
): string | null {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return value.toISOString();
	if (style === "number" && typeof value === "number") {
		return new Intl.NumberFormat("en-US").format(value);
	}
	return String(value);
}

/**
 * Interpolates dictionary templates, including the small ICU subset we use:
 * `{name}`, `{name, number}`, and `{name, plural, one {...} other {...}}`.
 */
function interpolate(template: string, values?: Values): string {
	if (!values) return template;

	let result = template.replace(
		/\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
		(_, key: string, one: string, other: string) => {
			const raw = values[key];
			const count = typeof raw === "number" ? raw : Number(raw);
			if (!Number.isFinite(count)) return `{${key}}`;
			const branch = count === 1 ? one : other;
			return branch.replace(/#/g, String(count));
		},
	);

	result = result.replace(/\{(\w+),\s*number\}/g, (match, key: string) => {
		const formatted = formatCopyValue(values[key], "number");
		return formatted ?? match;
	});

	return result.replace(/\{(\w+)\}/g, (match, key: string) => {
		const formatted = formatCopyValue(values[key]);
		return formatted ?? match;
	});
}

export type CopyTranslator = {
	(key: string, values?: Values): string;
	has: (key: string) => boolean;
	raw: (key: string) => unknown;
};

/**
 * Builds a translator scoped to a namespace in the English copy dictionary.
 */
export function createCopy(namespace = ""): CopyTranslator {
	const root = namespace
		? getAtPath(messages, namespace)
		: (messages as MessageTree);

	const translate = ((key: string, values?: Values) => {
		const value = getAtPath(root, key);
		if (typeof value === "string") {
			return interpolate(value, values);
		}
		return key;
	}) as CopyTranslator;

	translate.has = (key: string) => {
		const value = getAtPath(root, key);
		return typeof value === "string" || value !== undefined;
	};

	translate.raw = (key: string) => getAtPath(root, key);

	return translate;
}

/** Client-side English copy helper. */
export function useCopy(namespace = ""): CopyTranslator {
	return createCopy(namespace);
}

/** Server-side English copy helper. */
export function getCopy(namespace = ""): CopyTranslator {
	return createCopy(namespace);
}

export { messages as englishCopy };
