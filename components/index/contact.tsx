"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowRight,
	Check,
	Mail,
	MapPin,
	Phone,
	Plane,
	Send,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCopy } from "@/lib/copy";
import { ReactNode, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	TurnstileWidget,
	type TurnstileWidgetHandle,
} from "@/components/ui/turnstile-widget";
import {
	sectionItemTransition,
	sectionRevealItem,
	useSectionReveal,
} from "@/hooks/use-section-reveal";
import { submitContactLead } from "@/lib/api/contact-lead";
import {
	type ContactFormValues,
	createContactSchema,
} from "@/lib/schemas/contact";
import SectionHead from "./section-head";

const inputClassName =
	"w-full rounded-[10px] border-[1.5px] border-(--border) bg-(--bg) px-4 py-3.5 text-inherit placeholder:text-(--text-subtle) transition-[border-color,box-shadow] focus:border-(--dash-brand) focus:outline-none focus-visible:ring-[3px] focus-visible:ring-(--dash-brand)/15";

const inputErrorClassName =
	"border-(--dash-warning) focus:border-(--dash-warning) focus-visible:ring-(--dash-warning)/15";

function FormLabel({
	htmlFor,
	children,
	required,
	optional,
}: {
	htmlFor: string;
	children: ReactNode;
	required?: boolean;
	optional?: string;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="mb-2 flex items-baseline gap-1.5 text-sm font-semibold"
		>
			<span>{children}</span>
			{required ? (
				<span className="text-(--dash-brand)" aria-hidden>
					*
				</span>
			) : null}
			{optional ? (
				<span className="font-normal text-(--text)">({optional})</span>
			) : null}
		</label>
	);
}

function FieldError({ id, message }: { id?: string; message?: string }) {
	if (!message) return null;

	return (
		<p id={id} className="mt-1.5 text-sm text-(--dash-warning)" role="alert">
			{message}
		</p>
	);
}

export default function Contact() {
	const t = useCopy("home.contact");
	const { ref, isRevealed, shouldAnimate } = useSectionReveal();
	const shouldReduceMotion = useReducedMotion();
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileRef = useRef<TurnstileWidgetHandle>(null);

	const contactSchema = useMemo(
		() =>
			createContactSchema({
				nameRequired: t("form_errors.name_required"),
				nameMax: t("form_errors.name_max"),
				emailRequired: t("form_errors.email_required"),
				emailInvalid: t("form_errors.email_invalid"),
				detailsRequired: t("form_errors.details_required"),
				detailsMax: t("form_errors.details_max"),
			}),
		[t],
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			name: "",
			email: "",
			details: "",
		},
	});

	const onSubmit = async (data: ContactFormValues) => {
		setSubmitError(null);

		if (!turnstileToken) {
			setSubmitError(t("form_error_turnstile"));
			return;
		}

		try {
			await submitContactLead(data, turnstileToken);
			setSubmitted(true);
			reset();
			setTurnstileToken(null);
			turnstileRef.current?.reset();
		} catch {
			setSubmitError(t("form_error_submit"));
			turnstileRef.current?.reset();
		}
	};

	return (
		<section ref={ref} className="home-section home-feature-alt">
			<SectionHead
				eyebrow={t("eyebrow")}
				headline={t("headline")}
				description={t("description")}
				centered
			/>

			<div className="home-wrap grid items-center gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[2fr_3fr] mt-[clamp(2rem,4vw,3rem)]">
				<motion.div
					className="flex flex-col justify-center lg:pr-[clamp(1.25rem,2.5vw,2rem)]"
					initial={
						shouldReduceMotion || !shouldAnimate
							? false
							: sectionRevealItem.hidden
					}
					animate={
						isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden
					}
					transition={sectionItemTransition(
						shouldAnimate,
						0,
						!!shouldReduceMotion,
					)}
				>
					<div className=" flex flex-col gap-10">
						{[
							{
								icon: Mail,
								title: t("email_title"),
								href: "mailto:info@codevider.com",
								value: "info@codevider.com",
							},
							{
								icon: Phone,
								title: t("phone_title"),
								href: "tel:+35569587742",
								value: "+355 69 587 7742",
							},
							{
								icon: MapPin,
								title: t("address_title"),
								href: "https://maps.app.goo.gl/T3FQyp46a1okGHr48",
								value: t("address_value"),
							},
						].map(({ icon: Icon, title, href, value }) => (
							<div key={title} className="flex gap-5">
								<span className="home-ecard-icon size-13 rounded-xl">
									<Icon className="size-6" aria-hidden />
								</span>
								<div>
									<h3 className="text-base font-semibold text-(--text-h)">
										{title}
									</h3>
									{href ? (
										<a
											href={href}
											className="mt-1.5 block text-base font-semibold text-(--dash-brand) transition-colors hover:text-(--text-h)"
										>
											{value}
										</a>
									) : (
										<p className="mt-1.5 text-pretty text-base leading-relaxed text-(--text)">
											{value}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</motion.div>

				<motion.div
					className="flex flex-col justify-center lg:pl-[clamp(1.25rem,2.5vw,2rem)]"
					initial={
						shouldReduceMotion || !shouldAnimate
							? false
							: sectionRevealItem.hidden
					}
					animate={
						isRevealed ? sectionRevealItem.visible : sectionRevealItem.hidden
					}
					transition={sectionItemTransition(
						shouldAnimate,
						0.1,
						!!shouldReduceMotion,
					)}
				>
					{submitted ? (
						<div className="surface-card rounded-3xl p-10 text-center">
							<div className="mx-auto mb-[18px] grid size-16 place-items-center rounded-full bg-(--dash-brand-bg) text-(--dash-brand)">
								<Check className="size-8" strokeWidth={2.4} aria-hidden />
							</div>
							<h3 className="text-xl font-semibold text-(--text-h)">
								{t("success_title")}
							</h3>
							<p className="mt-2 text-pretty text-(--text)">
								{t("success_message")}
							</p>
						</div>
					) : (
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="surface-card rounded-3xl p-[clamp(28px,3.5vw,44px)] text-(--text-h)"
							noValidate
						>
							<div className=" grid gap-5 sm:grid-cols-2">
								<div>
									<FormLabel htmlFor="contact-name" required>
										{t("form_name")}
									</FormLabel>
									<input
										id="contact-name"
										type="text"
										autoComplete="name"
										maxLength={100}
										placeholder={t("form_name_placeholder")}
										className={`${inputClassName}${errors.name ? ` ${inputErrorClassName}` : ""}`}
										aria-invalid={errors.name ? true : undefined}
										aria-describedby={
											errors.name ? "contact-name-error" : undefined
										}
										{...register("name")}
									/>
									<FieldError
										message={errors.name?.message}
										id="contact-name-error"
									/>
								</div>
								<div>
									<FormLabel htmlFor="contact-email" required>
										{t("form_email")}
									</FormLabel>
									<input
										id="contact-email"
										type="email"
										autoComplete="email"
										placeholder={t("form_email_placeholder")}
										className={`${inputClassName}${errors.email ? ` ${inputErrorClassName}` : ""}`}
										aria-invalid={errors.email ? true : undefined}
										aria-describedby={
											errors.email ? "contact-email-error" : undefined
										}
										{...register("email")}
									/>
									<FieldError
										message={errors.email?.message}
										id="contact-email-error"
									/>
								</div>
							</div>

							<div className="mt-5">
								<FormLabel htmlFor="contact-details" required>
									{t("form_message")}
								</FormLabel>
								<textarea
									id="contact-details"
									rows={5}
									maxLength={1000}
									placeholder={t("form_message_placeholder")}
									className={`${inputClassName} min-h-[132px] resize-y${errors.details ? ` ${inputErrorClassName}` : ""}`}
									aria-invalid={errors.details ? true : undefined}
									aria-describedby={
										errors.details ? "contact-details-error" : undefined
									}
									{...register("details")}
								/>
								<FieldError
									message={errors.details?.message}
									id="contact-details-error"
								/>
							</div>

							<div className="mt-5 w-full">
								{/* to make the widge be visible to everyone, just change the className of data-appearance to "always" */}
								{/* by default the token is automatically sent to the server and the server validates it */}
								<TurnstileWidget
									ref={turnstileRef}
									onTokenChange={setTurnstileToken}
								/>
							</div>

							{submitError ? (
								<p className="mt-5 text-sm text-(--dash-warning)" role="alert">
									{submitError}
								</p>
							) : null}

							<button
								type="submit"
								disabled={isSubmitting}
								aria-busy={isSubmitting}
								className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--dash-brand-solid) py-3.5 pl-6 pr-5 text-base font-semibold text-(--on-brand) transition-[background-color,transform] duration-150 ease-out hover:bg-(--dash-brand-solid-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) active:scale-[0.96] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSubmitting ? t("form_submitting") : t("form_submit")}
								<Send className="size-4" aria-hidden />
							</button>
						</form>
					)}
				</motion.div>
			</div>
		</section>
	);
}
