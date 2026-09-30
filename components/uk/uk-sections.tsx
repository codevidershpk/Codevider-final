import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { UkHeroBackdrop } from "./uk-hero-backdrop";

const CALENDLY_URL = "https://calendly.com/codevider/pasho";

const HERO_FACTS = [
	{ value: "25", label: "senior engineers" },
	{ value: "45+", label: "projects shipped" },
	{ value: "6+", label: "years" },
] as const;

export function UkHero() {
	return (
		<>
			<section className="uk-hero">
				<UkHeroBackdrop />
				<div className="uk-wrap uk-hero__grid">
					<div className="uk-hero__copy">
						<p className="uk-event hero-reveal hero-reveal-1">
							The Business Show London · 11–12 Nov 2026
						</p>
						<h1 className="uk-h1 hero-reveal hero-reveal-2">
							Senior engineers
							<br />
							build it.
							<br />
							<em>Then we automate it.</em>
						</h1>
						<p className="uk-lead hero-reveal hero-reveal-3">
							We join your team, ship the software, and build the agents that
							take over the busywork around it.
						</p>
						<div className="uk-hero__cta">
							<div className="uk-actions hero-reveal hero-reveal-3">
								<a href="#uk-contact" className="uk-btn uk-btn--primary">
									Tell us what you&apos;re working on
									<ArrowRight className="size-4" aria-hidden />
								</a>
								<a
									href={CALENDLY_URL}
									target="_blank"
									rel="noreferrer"
									className="uk-btn uk-btn--text"
								>
									Book a 30-min call
									<ArrowUpRight className="size-4" aria-hidden />
								</a>
							</div>
							<dl className="uk-facts hero-reveal hero-reveal-4">
								{HERO_FACTS.map((f) => (
									<div key={f.label}>
										<dt>{f.label}</dt>
										<dd>{f.value}</dd>
									</div>
								))}
							</dl>
						</div>
					</div>

					<aside
						className="uk-ticket hero-reveal hero-reveal-4"
						aria-label="Find us at the show"
					>
						<div className="uk-ticket__top">
							<span>Exhibitor</span>
							<span>Hall · Stand</span>
						</div>
						<p className="uk-ticket__no">B1350</p>
						<p className="uk-ticket__venue">ExCeL London</p>
						<div className="uk-ticket__perf" aria-hidden />
						<dl className="uk-ticket__rows">
							<div>
								<dt>Dates</dt>
								<dd>11–12 Nov 2026</dd>
							</div>
							<div>
								<dt>Where</dt>
								<dd>Royal Victoria Dock</dd>
							</div>
						</dl>
					</aside>
				</div>
			</section>
		</>
	);
}

const CAPABILITIES = [
	{
		title: "Product engineering",
		body: "Senior engineers embedded with your team. 8+ years average, no juniors on client code, first commit inside two weeks.",
	},
	{
		title: "AI & automation",
		body: "Agents integrated into the workflows you already use, with a human approval gate before anything ships. We run Codevider on seven of them.",
	},
	{
		title: "Vibe-Code Rescue",
		body: "When the prototype works but the product doesn't. For apps built with Lovable, Cursor, Bolt, v0, Claude Code and Replit.",
		href: "#rescue",
	},
] as const;

export function UkServices() {
	return (
		<RevealGroup as="section" className="uk-section" id="what-we-do">
			<div className="uk-wrap uk-services">
				<div>
					<Reveal as="p" className="uk-label">
						What we do
					</Reveal>
					<Reveal as="h2" delay={0.04} className="uk-h2">
						Build software your business can actually grow on.
					</Reveal>
				</div>
				<ol className="uk-caps">
					{CAPABILITIES.map((c, i) => (
						<Reveal as="li" key={c.title} delay={0.06 * i}>
							<span className="uk-caps__n" aria-hidden>
								{String(i + 1).padStart(2, "0")}
							</span>
							<div>
								<h3 className="uk-h3">
									{"href" in c ? <a href={c.href}>{c.title}</a> : c.title}
								</h3>
								<p className="uk-body">{c.body}</p>
							</div>
						</Reveal>
					))}
				</ol>
			</div>
		</RevealGroup>
	);
}

const RESCUE_STEPS = [
	{
		title: "Understand",
		body: "We look at the product and the codebase. It doesn't need to be clean. That's why we're here.",
	},
	{
		title: "Assess",
		body: "We identify the risk, the debt and the blockers, and tell you honestly which is which.",
	},
	{
		title: "Rescue",
		body: "We fix what's blocking you. You keep your data, users, business logic and integrations.",
	},
	{
		title: "Move forward",
		body: "Keep building with us, hand it back to your team, or keep us on as a partner. Your call.",
	},
] as const;

export function UkRescue() {
	return (
		<section className="uk-rescue" id="rescue">
			<RevealGroup className="uk-wrap uk-rescue__grid">
				<div>
					<Reveal as="p" className="uk-label uk-label--inverse">
						Vibe-Code Rescue
					</Reveal>
					<Reveal as="h2" delay={0.04} className="uk-rescue__h">
						<span className="uk-rescue__we">We fix</span>
						<span className="uk-blocks" tabIndex={0}>
							<span className="uk-block uk-block--1">vibe</span>
							<span className="uk-block uk-block--2">coded</span>
							<span className="uk-block uk-block--3">apps.</span>
						</span>
					</Reveal>
					<Reveal delay={0.08}>
						<p className="uk-rescue__body">
							It shipped in a weekend. Then more users arrived, more features,
							more edge cases, and it started breaking itself. You don&apos;t
							need to throw away months of work because the code underneath
							needs help.
						</p>
						<Link href="/vibe-code-rescue" className="uk-link uk-link--inverse">
							The full Vibe-Code Rescue page
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</Reveal>
				</div>
				<div className="uk-rescue__side">
					<Reveal delay={0.1} as="ol" className="uk-steps">
						{RESCUE_STEPS.map((step, index) => (
							<li key={step.title}>
								<span className="uk-steps__n" aria-hidden>
									{String(index + 1).padStart(2, "0")}
								</span>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</li>
						))}
					</Reveal>
					<Reveal delay={0.14}>
						<p className="uk-rescue__pull">
							We don&apos;t quote a rescue before we&apos;ve looked at the code.
							Anyone who does is guessing.
						</p>
					</Reveal>
				</div>
			</RevealGroup>
		</section>
	);
}

const STATS = [
	{ value: "2019", label: "Founded, shipping from Tirana" },
	{ value: "25", label: "Senior engineers" },
	{ value: "45+", label: "Projects shipped" },
	{ value: "74", label: "Production releases, none missed" },
	{ value: "<0.3%", label: "Escaped defects" },
] as const;

export function UkWhy() {
	return (
		<RevealGroup
			as="section"
			className="uk-section uk-section--tint"
			id="why-us"
		>
			<div className="uk-wrap">
				<div className="uk-why">
					<div className="uk-why__head">
						<Reveal as="p" className="uk-label">
							Why us
						</Reveal>
						<Reveal as="h2" delay={0.04} className="uk-h2">
							Senior engineers who stay close to the work.
						</Reveal>
						<Reveal delay={0.08}>
							<p className="uk-body uk-why__lede">
								The people who start your project are the ones still shipping it
								years later. That's why clients don&apos;t leave and releases
								don&apos;t slip.
							</p>
						</Reveal>
					</div>
					<Reveal delay={0.1} as="dl" className="uk-numbers">
						{STATS.map((s) => (
							<div key={s.value} className="uk-numbers__item">
								<dt>{s.label}</dt>
								<dd>{s.value}</dd>
							</div>
						))}
					</Reveal>
				</div>
			</div>
		</RevealGroup>
	);
}
