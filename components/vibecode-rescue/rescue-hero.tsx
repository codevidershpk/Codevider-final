"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { RescueWord } from "./rescue-word";

export function RescueHero() {
	return (
		<section className="vcr-hero">
			<div className="vcr-wrap vcr-hero__grid">
				<div className="vcr-hero__copy">
					<p className="vcr-eyebrow">Vibe-Code Rescue</p>
					<h1 className="vcr-hero__title">
						We fix <span className="vcr-nowrap">vibe-coded</span> apps.
					</h1>
					<p className="vcr-hero__lead">
						From AI-generated prototype to production software. When features
						start breaking each other and the AI keeps going in circles, we step
						in, make sense of the mess, and get the product moving again.
					</p>
					<div className="vcr-actions">
						<a href="#contact" className="home-brand-btn vcr-btn">
							Rescue my app
							<ArrowRight className="size-4" aria-hidden />
						</a>
						<a
							href="https://calendly.com/codevider/pasho"
							className="vcr-btn vcr-btn--secondary"
						>
							Talk to an engineer
							<ArrowUpRight className="size-4" aria-hidden />
						</a>
					</div>
				</div>

				<div className="vcr-hero__panel">
					<RescueWord />
					<p className="vcr-hero__turn">
						<span>You built it fast.</span>
						<span>Then it got complicated.</span>
					</p>
				</div>
			</div>
		</section>
	);
}
