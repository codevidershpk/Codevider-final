import {
	ArrowRight,
	ArrowUpRight,
	Bot,
	Check,
	Cloud,
	Code2,
	Compass,
	FileCode2,
	GitMerge,
	Hammer,
	Handshake,
	KeyRound,
	Layers,
	LifeBuoy,
	type LucideIcon,
	Monitor,
	PauseCircle,
	Plug,
	Rocket,
	ScanSearch,
	Search,
	Server,
	TrendingUp,
	Users,
	Wallet,
	Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import { Reveal, RevealGroup } from "@/components/ui/reveal";

const PRESSURE: { label: string; icon: LucideIcon }[] = [
	{ label: "More users", icon: Users },
	{ label: "More features", icon: Layers },
	{ label: "More integrations", icon: Plug },
	{ label: "More edge cases", icon: GitMerge },
];

const SITUATIONS: { title: string; body: string; icon: LucideIcon }[] = [
	{
		title: "A stalled project",
		body: "Development has slowed down and every new feature creates another problem.",
		icon: PauseCircle,
	},
	{
		title: "A growing product",
		body: "Your users are growing faster than the architecture can handle.",
		icon: TrendingUp,
	},
	{
		title: "An inherited codebase",
		body: "Your previous developer or agency is gone and you’re left with the code.",
		icon: FileCode2,
	},
	{
		title: "An expensive AI stack",
		body: "Your application works, but the AI and infrastructure bill keeps climbing.",
		icon: Wallet,
	},
	{
		title: "An unmaintainable product",
		body: "It works, but nobody wants to be the person responsible for changing it.",
		icon: Wrench,
	},
	{
		title: "A product ready for its next stage",
		body: "The prototype proved the idea. Now it needs proper engineering behind it.",
		icon: Rocket,
	},
];

const TOOLS = [
	"Lovable",
	"Cursor",
	"Bolt",
	"v0",
	"Claude Code",
	"Replit",
	"Other AI coding tools",
] as const;

const STEPS: { title: string; body: string; icon: LucideIcon }[] = [
	{
		title: "Understand",
		body: "We get inside the product, the codebase and the way it currently works.",
		icon: Search,
	},
	{
		title: "Assess",
		body: "We identify the technical risks, blockers and areas that need immediate attention.",
		icon: ScanSearch,
	},
	{
		title: "Rescue & rebuild",
		body: "We fix what’s blocking the product and, where necessary, rework the parts that can’t support the next stage.",
		icon: LifeBuoy,
	},
	{
		title: "Move forward",
		body: "Continue development with us or take the improved system back to your team.",
		icon: Compass,
	},
];

const STACK: { title: string; items: string[]; icon: LucideIcon }[] = [
	{
		title: "Frontend",
		items: ["Web", "Mobile", "React", "Next.js"],
		icon: Monitor,
	},
	{
		title: "Backend",
		items: ["APIs", "Node.js", "Go", "Databases"],
		icon: Server,
	},
	{ title: "AI", items: ["LLMs", "Agents", "RAG", "AI APIs"], icon: Bot },
	{
		title: "Infrastructure",
		items: ["Cloud", "Containers", "CI/CD", "Deployment"],
		icon: Cloud,
	},
];

const PRESERVE = [
	"Your data",
	"Your users",
	"Your business logic",
	"Your existing integrations",
] as const;

function SectionHead({
	eyebrow,
	title,
	children,
}: {
	eyebrow: string;
	title: ReactNode;
	children?: ReactNode;
}) {
	return (
		<header className="vcr-head">
			<Reveal as="p" className="vcr-eyebrow">
				{eyebrow}
			</Reveal>
			<Reveal as="h2" delay={0.06} className="vcr-h2">
				{title}
			</Reveal>
			{children ? (
				<Reveal delay={0.12} className="vcr-head__lead">
					{children}
				</Reveal>
			) : null}
		</header>
	);
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
	return (
		<span className="vcr-icon" aria-hidden>
			<Icon className="size-5" strokeWidth={1.75} />
		</span>
	);
}

export function RescueReality() {
	return (
		<RevealGroup
			as="section"
			className="vcr-section vcr-section--tint"
			id="reality"
		>
			<div className="vcr-wrap">
				<SectionHead eyebrow="The problem" title="It looked easy at first.">
					<div className="vcr-reality">
						<p>
							AI made building the first version incredibly fast. The problem
							starts when the product becomes real, and the code that got you to
							the prototype starts slowing everything down.
						</p>
						<ul className="vcr-pressure">
							{PRESSURE.map(({ label, icon }) => (
								<li key={label}>
									<IconBadge icon={icon} />
									<span>{label}</span>
								</li>
							))}
						</ul>
						<p className="vcr-punch">That’s the point where we take over.</p>
					</div>
				</SectionHead>
			</div>
		</RevealGroup>
	);
}

export function RescueSituations() {
	return (
		<RevealGroup as="section" className="vcr-section" id="situations">
			<div className="vcr-wrap">
				<SectionHead eyebrow="Who it’s for" title="What can we rescue?" />
				<ul className="vcr-grid vcr-grid--3">
					{SITUATIONS.map((item, index) => (
						<Reveal
							as="li"
							key={item.title}
							delay={0.16 + index * 0.06}
							className="vcr-card"
						>
							<IconBadge icon={item.icon} />
							<h3 className="vcr-h3">{item.title}</h3>
							<p className="vcr-card__body">{item.body}</p>
						</Reveal>
					))}
				</ul>
			</div>
		</RevealGroup>
	);
}

export function RescueArrival() {
	return (
		<RevealGroup as="section" className="vcr-band" id="arrival">
			<div className="vcr-wrap vcr-split">
				<Reveal>
					<h2 className="vcr-h2 vcr-band__title">
						We don’t need a clean codebase.
						<span>That’s why we’re here.</span>
					</h2>
					<p className="vcr-band__body">
						We don’t expect everything to be perfect before we arrive. We’ll
						figure out what’s worth keeping, what needs attention, and what
						needs to change.
					</p>
				</Reveal>
				<Reveal delay={0.12}>
					<p className="vcr-band__label">
						<Code2 className="size-4" aria-hidden />
						We step into projects built with
					</p>
					<ul className="vcr-tools">
						{TOOLS.map((tool) => (
							<li key={tool}>{tool}</li>
						))}
					</ul>
				</Reveal>
			</div>
		</RevealGroup>
	);
}

export function RescueProcess() {
	return (
		<RevealGroup
			as="section"
			className="vcr-section vcr-section--tint"
			id="process"
		>
			<div className="vcr-wrap">
				<SectionHead
					eyebrow="How it works"
					title="From wherever you are now."
				/>
				<ol className="vcr-grid vcr-grid--4">
					{STEPS.map((step, index) => (
						<Reveal
							as="li"
							key={step.title}
							delay={0.16 + index * 0.06}
							className="vcr-card vcr-step"
						>
							<div className="vcr-step__top">
								<IconBadge icon={step.icon} />
								<span className="vcr-step__index">
									{String(index + 1).padStart(2, "0")}
								</span>
							</div>
							<h3 className="vcr-h3">{step.title}</h3>
							<p className="vcr-card__body">{step.body}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</RevealGroup>
	);
}

export function RescueStack() {
	return (
		<RevealGroup as="section" className="vcr-section" id="stack">
			<div className="vcr-wrap">
				<SectionHead eyebrow="Technology" title="Every stack. Every stage.">
					<p>
						We work with the stack you’ve got, not the stack we wish you’d
						chosen, and everything in between.
					</p>
				</SectionHead>
				<div className="vcr-stack">
					{STACK.map((group, index) => (
						<Reveal
							key={group.title}
							delay={0.16 + index * 0.06}
							className="vcr-stack__row"
						>
							<div className="vcr-stack__title">
								<IconBadge icon={group.icon} />
								<h3 className="vcr-h3">{group.title}</h3>
							</div>
							<div className="vcr-stack__techs">
								<ul className="vcr-tags">
									{group.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</div>
						</Reveal>
					))}
				</div>
				<Reveal as="p" delay={0.4} className="vcr-stack__more">
					And so much more. If it is in production, we can work with it.
				</Reveal>
			</div>
		</RevealGroup>
	);
}

const AFTER: { title: string; body: string; icon: LucideIcon }[] = [
	{
		title: "Keep building with us",
		body: "We continue developing the product alongside you.",
		icon: Hammer,
	},
	{
		title: "Hand it to your team",
		body: "We help your internal team take the codebase over with confidence.",
		icon: KeyRound,
	},
	{
		title: "Stay as your partner",
		body: "We stay involved as your long-term engineering partner.",
		icon: Handshake,
	},
];

export function RescueKeep() {
	return (
		<RevealGroup
			as="section"
			className="vcr-section vcr-section--tint"
			id="keep"
		>
			<div className="vcr-wrap">
				<div className="vcr-split">
					<SectionHead eyebrow="No restart" title="Keep what matters.">
						<p>
							You don’t need to throw away months of work just because the code
							underneath it needs help. We preserve what you’ve built and fix
							the engineering underneath it.
						</p>
					</SectionHead>
					<Reveal as="ul" delay={0.18} className="vcr-card vcr-checklist">
						{PRESERVE.map((item) => (
							<li key={item}>
								<Check className="size-5" strokeWidth={2} aria-hidden />
								{item}
							</li>
						))}
					</Reveal>
				</div>
			</div>
		</RevealGroup>
	);
}

export function RescueAfter() {
	return (
		<RevealGroup as="section" className="vcr-section" id="after">
			<div className="vcr-wrap">
				<SectionHead eyebrow="What’s next" title="After the rescue.">
					<p>
						Rescue can be the beginning of the next phase, not the end of the
						project. You don’t have to figure that part out alone.
					</p>
				</SectionHead>
				<ol className="vcr-grid vcr-grid--3">
					{AFTER.map((item, index) => (
						<Reveal
							as="li"
							key={item.title}
							delay={0.16 + index * 0.06}
							className="vcr-card vcr-after__item"
						>
							<div className="vcr-step__top">
								<IconBadge icon={item.icon} />
								<span className="vcr-step__index">
									{String(index + 1).padStart(2, "0")}
								</span>
							</div>
							<h3 className="vcr-h3">{item.title}</h3>
							<p className="vcr-card__body">{item.body}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</RevealGroup>
	);
}

export function RescueClose() {
	return (
		<RevealGroup
			as="section"
			className="vcr-section vcr-section--tint"
			id="next"
		>
			<div className="vcr-wrap">
				<div className="vcr-cta">
					<Reveal as="p" className="vcr-eyebrow vcr-eyebrow--center">
						Built with AI. Ready for engineers.
					</Reveal>
					<Reveal as="h2" delay={0.06} className="vcr-h2">
						Your prototype got you this far. Let’s see where it can go next.
					</Reveal>
					<Reveal as="p" delay={0.12} className="vcr-cta__body">
						The goal isn’t to make your app look like it was never vibe-coded.
						It’s to make it good enough to keep building. Tell us what you’ve
						built, what’s breaking, and where you’re stuck.
					</Reveal>
					<Reveal delay={0.18} className="vcr-actions vcr-actions--center">
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
					</Reveal>
				</div>
			</div>
		</RevealGroup>
	);
}
