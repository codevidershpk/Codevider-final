"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import {
	TurnstileWidget,
	type TurnstileWidgetHandle,
} from "@/components/ui/turnstile-widget";
import { submitContactLead } from "@/lib/api/contact-lead";

const INTERESTS = [
	{ value: "fix", label: "Fix an app" },
	{ value: "expand", label: "Add engineers" },
	{ value: "automate", label: "Automate a workflow" },
	{ value: "not-sure", label: "Not sure yet" },
] as const;

const TIMELINES = [
	"As soon as possible",
	"Within a month",
	"1–3 months",
	"Just exploring",
] as const;

const BUDGETS = [
	"Under £10k",
	"£10–25k",
	"£25–75k",
	"£75k+",
	"Not sure",
] as const;

const ukSchema = z.object({
	name: z.string().trim().min(1, "Please tell us your name.").max(100),
	email: z
		.string()
		.trim()
		.min(1, "Please add your work email.")
		.email("That email doesn't look right."),
	company: z.string().trim().max(120).optional(),
	role: z.string().trim().max(120).optional(),
	interest: z.enum(["fix", "expand", "automate", "not-sure"]),
	problem: z
		.string()
		.trim()
		.min(1, "One or two sentences is enough.")
		.max(800, "Keep it under 800 characters."),
	timeline: z.string().optional(),
	budget: z.string().optional(),
	phone: z.string().trim().max(60).optional(),
	consent: z.literal(true, {
		error: "Please confirm we can reply to your enquiry.",
	}),
});

type UkFormValues = z.infer<typeof ukSchema>;

const interestLabel = (value: UkFormValues["interest"]) =>
	INTERESTS.find((i) => i.value === value)?.label ?? value;

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<p className="uk-error" role="alert">
			{message}
		</p>
	);
}

export function UkContact() {
	const [submitted, setSubmitted] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileRef = useRef<TurnstileWidgetHandle>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<UkFormValues>({
		resolver: zodResolver(ukSchema),
		defaultValues: {
			name: "",
			email: "",
			company: "",
			role: "",
			interest: "not-sure",
			problem: "",
			timeline: "",
			budget: "",
			phone: "",
			consent: undefined as unknown as true,
		},
	});

	const onSubmit = async (data: UkFormValues) => {
		setSubmitError(null);

		if (!turnstileToken) {
			setSubmitError("Please complete the verification check.");
			return;
		}

		const meta = [
			`[UK show page · Business Show London · Stand B1350]`,
			`Company: ${data.company || "n/a"}`,
			`Role: ${data.role || "n/a"}`,
			`Interested in: ${interestLabel(data.interest)}`,
			`Timeline: ${data.timeline || "n/a"}`,
			`Budget: ${data.budget || "n/a"}`,
			`Phone/WhatsApp: ${data.phone || "n/a"}`,
		].join("\n");

		try {
			await submitContactLead(
				{
					name: data.name,
					email: data.email,
					details: `${data.problem}\n\n${meta}`,
				},
				turnstileToken,
			);
			setSubmitted(true);
			reset();
			setTurnstileToken(null);
			turnstileRef.current?.reset();
		} catch {
			setSubmitError(
				"Something went wrong sending your message. Please try again.",
			);
			turnstileRef.current?.reset();
		}
	};

	return (
		<RevealGroup as="section" className="uk-section" id="uk-contact">
			<div className="uk-wrap">
				<div className="uk-contact__grid">
					<div className="uk-contact__intro">
						<Reveal as="h2" className="uk-h2">
							What are you <em>stuck on?</em>
						</Reveal>
						<Reveal delay={0.06}>
							<p className="uk-contact__lede">
								Tell us what&apos;s happening. We&apos;ll tell you what
								we&apos;d do next.
							</p>
							<p className="uk-body uk-contact__note">
								At the show? Skip the form and bring your repo to Stand B1350
								for a free 15-minute health check. Or email{" "}
								<a href="mailto:info@codevider.com">info@codevider.com</a>.
							</p>
						</Reveal>
					</div>

					<Reveal delay={0.08}>
						{submitted ? (
							<div className="uk-success">
								<div className="uk-success__ring">
									<Check className="size-8" strokeWidth={2.4} aria-hidden />
								</div>
								<h3>Message received.</h3>
								<p>
									Thanks. A person will reply, usually within a day. If
									you&apos;re at ExCeL, come say hello at Stand B1350.
								</p>
							</div>
						) : (
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="uk-form"
								noValidate
							>
								<div className="uk-form__grid uk-form__grid--3">
									<div
										className={`uk-field${errors.name ? " uk-field--error" : ""}`}
									>
										<label htmlFor="uk-name">
											Name{" "}
											<span className="uk-required" aria-hidden>
												*
											</span>
										</label>
										<input
											id="uk-name"
											type="text"
											autoComplete="name"
											maxLength={100}
											aria-invalid={errors.name ? true : undefined}
											aria-describedby={
												errors.name ? "uk-name-error" : undefined
											}
											{...register("name")}
										/>
										<FieldError message={errors.name?.message} />
									</div>
									<div
										className={`uk-field${errors.email ? " uk-field--error" : ""}`}
									>
										<label htmlFor="uk-email">
											Work email{" "}
											<span className="uk-required" aria-hidden>
												*
											</span>
										</label>
										<input
											id="uk-email"
											type="email"
											autoComplete="email"
											aria-invalid={errors.email ? true : undefined}
											aria-describedby={
												errors.email ? "uk-email-error" : undefined
											}
											{...register("email")}
										/>
										<FieldError message={errors.email?.message} />
									</div>
									<div className="uk-field">
										<label htmlFor="uk-company">Company</label>
										<input
											id="uk-company"
											type="text"
											autoComplete="organization"
											maxLength={120}
											{...register("company")}
										/>
									</div>
								</div>

								<div
									className={`uk-field${errors.problem ? " uk-field--error" : ""}`}
								>
									<label htmlFor="uk-problem">
										What&apos;s going wrong?{" "}
										<span className="uk-required" aria-hidden>
											*
										</span>
									</label>
									<textarea
										id="uk-problem"
										rows={5}
										maxLength={800}
										aria-invalid={errors.problem ? true : undefined}
										{...register("problem")}
									/>
									<FieldError message={errors.problem?.message} />
								</div>
								<fieldset className="uk-radios">
									<legend className="uk-sr">What do you need</legend>
									{INTERESTS.map((item) => (
										<label key={item.value} className="uk-radio">
											<input
												type="radio"
												value={item.value}
												{...register("interest")}
											/>
											<span>{item.label}</span>
										</label>
									))}
								</fieldset>
								<div className={`uk-more${moreOpen ? " uk-more--open" : ""}`}>
									<button
										type="button"
										className="uk-more__toggle"
										aria-expanded={moreOpen}
										aria-controls="uk-more-panel"
										onClick={() => setMoreOpen((open) => !open)}
									>
										<span>Add timeline, budget or phone</span>
										<span className="uk-optional">optional</span>
										<ChevronDown
											className="uk-more__chevron size-4"
											aria-hidden
										/>
									</button>
									<div
										id="uk-more-panel"
										className="uk-more__panel"
										inert={!moreOpen}
									>
										<div className="uk-more__inner">
											<div className="uk-form__grid uk-form__grid--2">
												<div className="uk-field">
													<label htmlFor="uk-role">Role</label>
													<input
														id="uk-role"
														type="text"
														autoComplete="organization-title"
														maxLength={120}
														{...register("role")}
													/>
												</div>
												<div className="uk-field">
													<label htmlFor="uk-phone">
														Phone / WhatsApp{" "}
														<span className="uk-optional">(optional)</span>
													</label>
													<input
														id="uk-phone"
														type="tel"
														autoComplete="tel"
														maxLength={60}
														{...register("phone")}
													/>
												</div>
											</div>
											<div className="uk-form__grid uk-form__grid--2">
												<div
													className={`uk-field${errors.timeline ? " uk-field--error" : ""}`}
												>
													<label htmlFor="uk-timeline">
														When do you need this solved
													</label>
													<select
														id="uk-timeline"
														aria-invalid={errors.timeline ? true : undefined}
														{...register("timeline")}
													>
														<option value="">Select…</option>
														{TIMELINES.map((t) => (
															<option key={t} value={t}>
																{t}
															</option>
														))}
													</select>
													<FieldError message={errors.timeline?.message} />
												</div>
												<div className="uk-field">
													<label htmlFor="uk-budget">
														Rough budget{" "}
														<span className="uk-optional">(optional)</span>
													</label>
													<select id="uk-budget" {...register("budget")}>
														<option value="">Select…</option>
														{BUDGETS.map((b) => (
															<option key={b} value={b}>
																{b}
															</option>
														))}
													</select>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div>
									<label className="uk-consent">
										<input type="checkbox" {...register("consent")} />
										<span>Codevider can contact me about my enquiry.</span>
									</label>
									<FieldError message={errors.consent?.message} />
								</div>

								<div className="w-full">
									<TurnstileWidget
										ref={turnstileRef}
										onTokenChange={setTurnstileToken}
										errorMessage="Please complete the verification check."
									/>
								</div>

								{submitError ? (
									<p
										className="uk-error"
										role="alert"
										style={{ marginTop: "0.75rem" }}
									>
										{submitError}
									</p>
								) : null}

								<button
									type="submit"
									disabled={isSubmitting}
									aria-busy={isSubmitting}
									className="uk-submit"
								>
									{isSubmitting ? "Sending…" : "Start the conversation"}
									<ArrowRight className="size-4" aria-hidden />
								</button>
								<p className="uk-submit-note">
									A person replies, usually within a day.
								</p>
							</form>
						)}
					</Reveal>
				</div>
			</div>
		</RevealGroup>
	);
}
