"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LetterGlitch } from "./letter-glitch";
import { RescueWord } from "./rescue-word";

export function RescueHero() {
	return (
		<section className="vcr-hero">
			<div className="vcr-hero__stage" aria-hidden>
				<LetterGlitch className="vcr-hero__canvas" />
			</div>
			<div className="vcr-hero__vignette" aria-hidden />
			<div className="vcr-hero__veil" aria-hidden />

			<div className="vcr-wrap vcr-hero__grid">
				<div className="vcr-hero__copy">
					<p className="vcr-eyebrow hero-reveal hero-reveal-1">
						Vibe-Code Rescue
					</p>
					<h1 className="vcr-hero__title hero-reveal hero-reveal-1">
						We fix
						<br />
						<span className="vcr-nowrap">vibe-coded apps.</span>
					</h1>
					<p className="vcr-hero__lead hero-reveal hero-reveal-2">
						From AI-generated prototype to production software. When features
						start breaking each other and the AI keeps going in circles, we step
						in, make sense of the mess, and get the product moving again.
					</p>
					<div className="vcr-actions hero-reveal hero-reveal-3">
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

				<div className="vcr-hero__panel hero-reveal hero-reveal-5">
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
