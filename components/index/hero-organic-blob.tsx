"use client";

import {
	ArrowRight,
	Check,
	Code2,
	Copy,
	ExternalLink,
	Sparkles,
	Terminal,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

// Dynamically import the OrganicBlob WebGL component with SSR disabled
const OrganicBlob = dynamic(() => import("./organic-blob"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full flex items-center justify-center">
			<div className="w-64 h-64 rounded-full bg-red-600/10 blur-2xl animate-pulse" />
		</div>
	),
});

interface HeroOrganicBlobProps {
	/** Custom heading */
	heading?: string;
	/** Custom lead text */
	subheading?: string;
	/** Preset hue shift in degrees (0 = NestJS Red, 150 = Cyan/Teal, 220 = Blue, 280 = Purple) */
	initialHue?: number;
	/** Base color hex */
	baseColor?: string;
}

const COLOR_PRESETS = [
	{ name: "NestJS Crimson", hex: "#ea2845", hue: 0 },
	{ name: "Cyber Cyan", hex: "#00f2fe", hue: 160 },
	{ name: "Electric Violet", hex: "#7928ca", hue: 270 },
	{ name: "Emerald", hex: "#10b981", hue: 100 },
];

export default function HeroOrganicBlob({
	heading = "Modern, Scalable & Enterprise-Grade Engineering",
	subheading = "Built with high-performance architectures, resilient microservices, and bespoke software solutions crafted to scale effortlessly.",
	initialHue = 0,
	baseColor = "#ea2845",
}: HeroOrganicBlobProps) {
	const [activeHue, setActiveHue] = useState(initialHue);
	const [activeBaseColor, setActiveBaseColor] = useState(baseColor);
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<"cli" | "bootstrap">("cli");

	const copyCode = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const cliCommand = "npm create @codevider/app@latest";
	const bootstrapSnippet = `import { CodeviderFactory } from '@codevider/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await CodeviderFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();`;

	return (
		<section className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#050303] text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 select-none">
			{/* Ambient Glowing Background */}
			<div
				className="pointer-events-none absolute inset-0 z-0 opacity-80"
				style={{
					background:
						"radial-gradient(ellipse 70% 60% at 50% 30%, rgba(120, 15, 32, 0.45), #050303 80%)",
				}}
			/>

			{/* Top Header Tagline / Badge */}
			<div className="relative z-10 mx-auto max-w-5xl text-center pt-8">
				<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-red-200/90 shadow-inner mb-6 hover:border-white/20 transition-colors">
					<Sparkles className="size-3.5 text-[#ea2845] animate-pulse" />
					<span>Inspired by NestJS Organic Architecture</span>
					<span className="h-3 w-px bg-white/15" />
					<span className="text-white/60 font-mono text-[11px]">v11.0</span>
				</div>

				{/* Main Title */}
				<h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
					More than just an ordinary{" "}
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-500">
						foundation
					</span>
				</h1>

				{/* Subtitle */}
				<p className="mt-6 text-base sm:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
					{subheading}
				</p>

				{/* CTA Buttons */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
					<Link
						href="#contact"
						className="group relative inline-flex items-center gap-2 rounded-2xl bg-white text-black font-semibold px-6 py-3.5 text-sm transition-all duration-200 hover:scale-[0.98] active:scale-[0.95] shadow-lg shadow-white/10 hover:shadow-white/20"
					>
						<span>Get started</span>
						<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
					</Link>

					<Link
						href="https://github.com"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm text-white font-medium px-6 py-3.5 text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/30 active:scale-[0.96]"
					>
						<svg
							role="img"
							viewBox="0 0 24 24"
							className="size-4 fill-current"
							aria-hidden="true"
						>
							<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
						</svg>
						<span>GitHub</span>
						<ExternalLink className="size-3 text-white/40 ml-0.5" />
					</Link>
				</div>
			</div>

			{/* Center Visual Stage: Interactive Organic Blob */}
			<div className="relative z-10 mx-auto w-full max-w-6xl my-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
				{/* Left Column: Code / Terminal Window */}
				<div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">
					<div className="rounded-2xl border border-white/10 bg-[#0d0d0d]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
						{/* Window Topbar */}
						<div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141414]">
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-[#ff5f56]/80" />
								<div className="size-3 rounded-full bg-[#ffbd2e]/80" />
								<div className="size-3 rounded-full bg-[#27c93f]/80" />
							</div>

							<div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
								<button
									type="button"
									onClick={() => setActiveTab("cli")}
									className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
										activeTab === "cli"
											? "bg-white/15 text-white font-medium shadow-sm"
											: "text-white/40 hover:text-white/70"
									}`}
								>
									<Terminal className="size-3" />
									CLI
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("bootstrap")}
									className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
										activeTab === "bootstrap"
											? "bg-white/15 text-white font-medium shadow-sm"
											: "text-white/40 hover:text-white/70"
									}`}
								>
									<Code2 className="size-3" />
									main.ts
								</button>
							</div>

							<button
								type="button"
								onClick={() =>
									copyCode(activeTab === "cli" ? cliCommand : bootstrapSnippet)
								}
								aria-label="Copy to clipboard"
								className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
							>
								{copied ? (
									<Check className="size-3.5 text-emerald-400" />
								) : (
									<Copy className="size-3.5" />
								)}
							</button>
						</div>

						{/* Code Body */}
						<div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
							{activeTab === "cli" ? (
								<div className="flex flex-col gap-2">
									<div className="text-white/40 select-none">
										# Quick project setup via CLI:
									</div>
									<div className="flex items-center gap-2 text-red-400">
										<span className="text-white/30">$</span>
										<span className="text-white font-semibold">
											{cliCommand}
										</span>
									</div>
									<div className="mt-2 text-white/50 text-xs">
										✔ Project created successfully in ./codevider-app
										<br />✔ Dependencies resolved and installed
										<br />✔ Ready to run:
										<span className="text-emerald-400 ml-1">
											npm run start:dev
										</span>
									</div>
								</div>
							) : (
								<pre className="text-white/90">
									<code>
										<span className="text-purple-400">import</span> {"{"}{" "}
										CodeviderFactory {"}"}{" "}
										<span className="text-purple-400">from</span>{" "}
										<span className="text-emerald-400">
											&apos;@codevider/core&apos;
										</span>
										;{"\n"}
										<span className="text-purple-400">import</span> {"{"}{" "}
										AppModule {"}"}{" "}
										<span className="text-purple-400">from</span>{" "}
										<span className="text-emerald-400">
											&apos;./app.module&apos;
										</span>
										;{"\n\n"}
										<span className="text-blue-400">async function</span>{" "}
										<span className="text-yellow-300">bootstrap</span>
										() {"{\n"}
										{"  "}
										<span className="text-purple-400">const</span> app ={" "}
										<span className="text-purple-400">await</span>{" "}
										CodeviderFactory.
										<span className="text-yellow-300">create</span>
										(AppModule);{"\n"}
										{"  "}
										<span className="text-purple-400">await</span> app.
										<span className="text-yellow-300">listen</span>(
										<span className="text-orange-400">3000</span>
										);{"\n"}
										{"}\n"}
										<span className="text-yellow-300">bootstrap</span>
										();
									</code>
								</pre>
							)}
						</div>
					</div>

					{/* Hue and Color Switcher */}
					<div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/60">
						<span className="flex items-center gap-2">
							<span
								className="size-2.5 rounded-full ring-2 ring-white/20"
								style={{ backgroundColor: activeBaseColor }}
							/>
							Shader Color Preset:
						</span>
						<div className="flex gap-1.5">
							{COLOR_PRESETS.map((preset) => (
								<button
									key={preset.name}
									type="button"
									onClick={() => {
										setActiveHue(preset.hue);
										setActiveBaseColor(preset.hex);
									}}
									title={preset.name}
									className={`size-6 rounded-full border transition-all ${
										activeBaseColor === preset.hex
											? "scale-110 border-white ring-2 ring-white/30"
											: "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
									}`}
									style={{ backgroundColor: preset.hex }}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Right Column: High-fidelity Organic Blob Canvas */}
				<div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2 relative">
					{/* Glow backdrop behind blob */}
					<div
						className="absolute size-72 sm:size-96 rounded-full blur-3xl opacity-40 transition-colors duration-700 pointer-events-none"
						style={{ backgroundColor: activeBaseColor }}
					/>

					{/* Canvas Container */}
					<div className="relative size-[340px] sm:size-[440px] md:size-[500px] cursor-pointer flex items-center justify-center">
						<OrganicBlob
							hue={activeHue}
							baseColor={activeBaseColor}
							hoverIntensity={0.25}
							rotateOnHover={true}
							autoRotate={false}
							backgroundColor="#050303"
							className="w-full h-full"
						/>

						{/* Subtle hover hint badge */}
						<div className="pointer-events-none absolute bottom-4 rounded-full bg-black/60 border border-white/10 px-3 py-1 text-[11px] text-white/50 backdrop-blur-md opacity-0 sm:opacity-75 transition-opacity">
							Hover over the blob to ripple
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Metrics Bar */}
			<div className="relative z-10 mx-auto w-full max-w-5xl border-t border-white/10 pt-8 pb-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
				<div>
					<div className="text-2xl sm:text-3xl font-semibold font-mono text-white">
						70M+
					</div>
					<div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
						Monthly Downloads
					</div>
				</div>
				<div>
					<div className="text-2xl sm:text-3xl font-semibold font-mono text-white">
						72K+
					</div>
					<div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
						GitHub Stars
					</div>
				</div>
				<div>
					<div className="text-2xl sm:text-3xl font-semibold font-mono text-white">
						99.99%
					</div>
					<div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
						Enterprise Uptime
					</div>
				</div>
				<div>
					<div className="text-2xl sm:text-3xl font-semibold font-mono text-white">
						TypeScript
					</div>
					<div className="text-xs text-white/50 mt-1 uppercase tracking-wider">
						First-Class Support
					</div>
				</div>
			</div>
		</section>
	);
}
