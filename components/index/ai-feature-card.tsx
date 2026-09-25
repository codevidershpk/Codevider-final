"use client";

import { Bot } from "lucide-react";
import { useCopy } from "@/lib/copy";
import "@/app/styles/home-ai-card.css";

export default function AiFeatureCard() {
	const t = useCopy("home.empower.cards.ai");

	return (
		<article className="home-ecard home-ecard--featured home-ai">
			<div className="home-ecard-head">
				<div className="home-ecard-icon">
					<Bot className="size-4 md:size-5" strokeWidth={1.75} aria-hidden />
				</div>
				<h3>{t("title")}</h3>
			</div>
			<p>{t("description")}</p>
		</article>
	);
}
