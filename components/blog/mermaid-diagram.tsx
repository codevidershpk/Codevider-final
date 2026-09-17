"use client";

import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
	/** Raw mermaid diagram source from the fenced code block. */
	chart: string;
};

type MermaidApi = {
	initialize: (config: Record<string, unknown>) => void;
	render: (id: string, text: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<MermaidApi> | null = null;

/** Loads mermaid on demand (kept out of the initial bundle). */
function loadMermaid(): Promise<MermaidApi> {
	if (!mermaidPromise) {
		mermaidPromise = import("mermaid").then(
			(mod) => (mod.default ?? mod) as unknown as MermaidApi,
		);
	}
	return mermaidPromise;
}

let mermaidRenderSeq = 0;

/**
 * Renders a mermaid fence into SVG, honoring the current theme.
 * The `<pre>` source stays as the loading / error / no-JS fallback.
 */
export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
	const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
	const baseId = `blog-mermaid-${rawId}`;
	const [svg, setSvg] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setSvg(null);
		setFailed(false);

		const render = async () => {
			let mermaid: MermaidApi;
			try {
				mermaid = await loadMermaid();
			} catch {
				if (!cancelled) setFailed(true);
				return;
			}
			if (cancelled) return;

			const dark = document.documentElement.classList.contains("dark");
			mermaid.initialize({
				startOnLoad: false,
				theme: dark ? "dark" : "neutral",
				themeVariables: { fontFamily: "inherit" },
			});

			try {
				mermaidRenderSeq += 1;
				const { svg } = await mermaid.render(
					`${baseId}-${mermaidRenderSeq}`,
					chart,
				);
				if (!cancelled) setSvg(svg);
			} catch {
				if (!cancelled) setFailed(true);
			}
		};

		void render();

		// Re-render the diagram when the light/dark theme flips.
		const themeObserver = new MutationObserver(() => {
			void render();
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => {
			cancelled = true;
			themeObserver.disconnect();
		};
	}, [baseId, chart]);

	if (!svg || failed) {
		return (
			<div className={`blog-mermaid${failed ? " blog-mermaid--error" : ""}`}>
				<pre className="blog-code" data-language="mermaid">
					<code>{chart}</code>
				</pre>
			</div>
		);
	}

	return (
		<div className="blog-mermaid">
			<pre className="blog-code" data-language="mermaid" hidden>
				<code>{chart}</code>
			</pre>
			<div
				className="blog-mermaid__diagram"
				role="img"
				aria-label="Diagram"
				dangerouslySetInnerHTML={{ __html: svg }}
			/>
		</div>
	);
}
