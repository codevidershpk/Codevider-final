"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { useCopy } from "@/lib/copy";
import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
	TurnstileWidget,
	type TurnstileWidgetHandle,
} from "@/components/ui/turnstile-widget";
import {
	JobApplicationError,
	submitJobApplication,
	uploadJobApplicationFiles,
} from "@/lib/api/job-application";
import {
	createJobApplicationSchema,
	type JobApplicationFormValues,
} from "@/lib/schemas/job-application";
import type { JobDetail } from "@/lib/types/recruit";

const inputClassName =
	"w-full rounded-[10px] border-[1.5px] border-(--border) bg-(--bg) px-4 py-3.5 text-inherit placeholder:text-(--text-subtle) transition-[border-color,box-shadow] focus:border-(--dash-brand) focus:outline-none focus-visible:ring-[3px] focus-visible:ring-(--dash-brand)/15";

const inputErrorClassName =
	"border-(--dash-warning) focus:border-(--dash-warning) focus-visible:ring-(--dash-warning)/15";

const GENDER_OPTIONS = [
	"male",
	"female",
	"non_binary",
	"prefer_not_to_say",
] as const;

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

function parseSkills(value: string) {
	return value
		.split(",")
		.map((skill) => skill.trim())
		.filter(Boolean);
}

function serializeSkills(skills: string[]) {
	return skills.join(", ");
}

type SkillsBadgeInputProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
	placeholder: string;
	removeLabel: string;
	invalid?: boolean;
	describedBy?: string;
};

function SkillsBadgeInput({
	id,
	value,
	onChange,
	onBlur,
	placeholder,
	removeLabel,
	invalid,
	describedBy,
}: SkillsBadgeInputProps) {
	const [draft, setDraft] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const skills = parseSkills(value);

	const commitSkill = (raw: string) => {
		const nextSkill = raw.trim().replace(/,+$/, "").trim();
		if (!nextSkill) {
			setDraft("");
			return false;
		}

		const exists = skills.some(
			(skill) => skill.toLowerCase() === nextSkill.toLowerCase(),
		);
		if (exists) {
			setDraft("");
			return true;
		}

		onChange(serializeSkills([...skills, nextSkill]));
		setDraft("");
		return true;
	};

	const removeSkill = (index: number) => {
		onChange(serializeSkills(skills.filter((_, i) => i !== index)));
		inputRef.current?.focus();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "," || event.key === "Tab") {
			if (!draft.trim()) {
				return;
			}

			event.preventDefault();
			commitSkill(draft);
			return;
		}

		if (event.key === "Backspace" && !draft && skills.length > 0) {
			event.preventDefault();
			removeSkill(skills.length - 1);
		}
	};

	return (
		<div
			className={`career-apply-form__skills${invalid ? " career-apply-form__skills--error" : ""}`}
			onClick={() => inputRef.current?.focus()}
		>
			{skills.map((skill, index) => (
				<span key={`${skill}-${index}`} className="career-apply-form__skill">
					{skill}
					<button
						type="button"
						className="career-apply-form__skill-remove"
						aria-label={`${removeLabel} ${skill}`}
						onClick={(event) => {
							event.stopPropagation();
							removeSkill(index);
						}}
					>
						<X className="size-3" strokeWidth={2.5} aria-hidden />
					</button>
				</span>
			))}
			<input
				ref={inputRef}
				id={id}
				type="text"
				value={draft}
				placeholder={skills.length === 0 ? placeholder : undefined}
				className="career-apply-form__skills-input"
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				onChange={(event) => {
					const next = event.target.value;
					if (!next.includes(",")) {
						setDraft(next);
						return;
					}

					const parts = next.split(",");
					const pending = parts.slice(0, -1);
					let nextSkills = skills;

					for (const part of pending) {
						const skill = part.trim();
						if (!skill) continue;
						if (
							nextSkills.some(
								(existing) => existing.toLowerCase() === skill.toLowerCase(),
							)
						) {
							continue;
						}
						nextSkills = [...nextSkills, skill];
					}

					if (nextSkills !== skills) {
						onChange(serializeSkills(nextSkills));
					}
					setDraft(parts[parts.length - 1]?.replace(/^\s+/, "") ?? "");
				}}
				onKeyDown={handleKeyDown}
				onBlur={() => {
					commitSkill(draft);
					onBlur();
				}}
			/>
		</div>
	);
}

type CareerApplyFormProps = {
	job: JobDetail;
};

export default function CareerApplyForm({ job }: CareerApplyFormProps) {
	const t = useCopy("career.apply.form");
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const [hasMounted, setHasMounted] = useState(false);
	const turnstileRef = useRef<TurnstileWidgetHandle>(null);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const schema = useMemo(
		() =>
			createJobApplicationSchema(
				{
					isDobRequired: job.is_dob_required,
					isGenderRequired: job.is_gender_required,
				},
				{
					fullNameRequired: t("errors.full_name_required"),
					fullNameMax: t("errors.full_name_max"),
					emailRequired: t("errors.email_required"),
					emailInvalid: t("errors.email_invalid"),
					phoneMax: t("errors.phone_max"),
					dobRequired: t("errors.dob_required"),
					genderRequired: t("errors.gender_required"),
					profileImageRequired: t("errors.profile_image_required"),
					resumeRequired: t("errors.resume_required"),
					bioMax: t("errors.bio_max"),
					coverLetterMax: t("errors.cover_letter_max"),
					skillsMax: t("errors.skills_max"),
				},
			),
		[job.is_dob_required, job.is_gender_required, t],
	);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<JobApplicationFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			full_name: "",
			email: "",
			phone: "",
			date_of_birth: "",
			gender: "",
			bio: "",
			cover_letter: "",
			skills: "",
		},
	});

	const resolveSubmitError = (error: unknown) => {
		if (error instanceof JobApplicationError) {
			switch (error.status) {
				case 400:
					return t("errors.validation");
				case 413:
					return t("errors.file_too_large");
				case 415:
					return t("errors.invalid_file_type");
				case 429:
					return t("errors.rate_limit");
				case 502:
					return t("errors.server_config");
				default:
					return t("errors.submit");
			}
		}

		return t("errors.submit");
	};

	const onSubmit = async (data: JobApplicationFormValues) => {
		setSubmitError(null);

		if (!data.profile_image || !data.resume) {
			return;
		}

		if (!turnstileToken) {
			setSubmitError(t("errors.turnstile"));
			return;
		}

		try {
			const upload = await uploadJobApplicationFiles(
				data.profile_image,
				data.resume,
			);

			const skills = parseSkills(data.skills ?? "");

			await submitJobApplication(
				{
					full_name: data.full_name,
					email: data.email,
					job_id: job.id,
					phone: data.phone?.trim() || undefined,
					date_of_birth: data.date_of_birth?.trim() || undefined,
					gender: data.gender?.trim() || undefined,
					photo: upload.profile_image,
					resume: upload.resume,
					bio: data.bio?.trim() || undefined,
					cover_letter: data.cover_letter?.trim() || undefined,
					skills: skills.length ? skills : undefined,
					experiences: [],
					educations: [],
					projects: [],
				},
				turnstileToken,
			);

			setSubmitted(true);
			reset();
			setTurnstileToken(null);
			turnstileRef.current?.reset();
		} catch (error) {
			setSubmitError(resolveSubmitError(error));
			turnstileRef.current?.reset();
		}
	};

	if (submitted) {
		return (
			<div className="career-apply-form__success">
				<div className="career-apply-form__success-icon" aria-hidden>
					<Check className="size-7" strokeWidth={2.4} />
				</div>
				<h3 className="career-apply-form__success-title">
					{t("success_title")}
				</h3>
				<p className="career-apply-form__success-message">
					{t("success_message")}
				</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="career-apply-form"
			noValidate
		>
			<p className="career-apply-form__intro">{t("intro")}</p>

			<div className="career-apply-form__grid">
				<div>
					<FormLabel htmlFor="apply-full-name" required>
						{t("full_name")}
					</FormLabel>
					<input
						id="apply-full-name"
						type="text"
						autoComplete="name"
						maxLength={100}
						placeholder={t("full_name_placeholder")}
						className={`${inputClassName}${errors.full_name ? ` ${inputErrorClassName}` : ""}`}
						aria-invalid={errors.full_name ? true : undefined}
						aria-describedby={
							errors.full_name ? "apply-full-name-error" : undefined
						}
						{...register("full_name")}
					/>
					<FieldError
						id="apply-full-name-error"
						message={errors.full_name?.message}
					/>
				</div>

				<div>
					<FormLabel htmlFor="apply-email" required>
						{t("email")}
					</FormLabel>
					<input
						id="apply-email"
						type="email"
						autoComplete="email"
						placeholder={t("email_placeholder")}
						className={`${inputClassName}${errors.email ? ` ${inputErrorClassName}` : ""}`}
						aria-invalid={errors.email ? true : undefined}
						aria-describedby={errors.email ? "apply-email-error" : undefined}
						{...register("email")}
					/>
					<FieldError id="apply-email-error" message={errors.email?.message} />
				</div>

				<div>
					<FormLabel htmlFor="apply-phone" optional={t("optional")}>
						{t("phone")}
					</FormLabel>
					<input
						id="apply-phone"
						type="tel"
						autoComplete="tel"
						placeholder={t("phone_placeholder")}
						className={`${inputClassName}${errors.phone ? ` ${inputErrorClassName}` : ""}`}
						aria-invalid={errors.phone ? true : undefined}
						aria-describedby={errors.phone ? "apply-phone-error" : undefined}
						{...register("phone")}
					/>
					<FieldError id="apply-phone-error" message={errors.phone?.message} />
				</div>

				{job.is_dob_required ? (
					<div>
						<FormLabel htmlFor="apply-dob" required>
							{t("date_of_birth")}
						</FormLabel>
						<input
							id="apply-dob"
							type="date"
							className={`${inputClassName}${errors.date_of_birth ? ` ${inputErrorClassName}` : ""}`}
							aria-invalid={errors.date_of_birth ? true : undefined}
							aria-describedby={
								errors.date_of_birth ? "apply-dob-error" : undefined
							}
							{...register("date_of_birth")}
						/>
						<FieldError
							id="apply-dob-error"
							message={errors.date_of_birth?.message}
						/>
					</div>
				) : null}

				{job.is_gender_required ? (
					<div>
						<FormLabel htmlFor="apply-gender" required>
							{t("gender")}
						</FormLabel>
						<select
							id="apply-gender"
							className={`${inputClassName}${errors.gender ? ` ${inputErrorClassName}` : ""}`}
							aria-invalid={errors.gender ? true : undefined}
							aria-describedby={
								errors.gender ? "apply-gender-error" : undefined
							}
							defaultValue=""
							{...register("gender")}
						>
							<option value="" disabled>
								{t("gender_placeholder")}
							</option>
							{GENDER_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{t(`gender_${option}`)}
								</option>
							))}
						</select>
						<FieldError
							id="apply-gender-error"
							message={errors.gender?.message}
						/>
					</div>
				) : null}
			</div>

			<div className="career-apply-form__files">
				<div>
					<FormLabel htmlFor="apply-profile-image" required>
						{t("profile_image")}
					</FormLabel>
					<Controller
						name="profile_image"
						control={control}
						render={({ field: { onChange, ref } }) => (
							<input
								id="apply-profile-image"
								ref={ref}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								className={`career-apply-form__file${errors.profile_image ? " career-apply-form__file--error" : ""}`}
								aria-invalid={errors.profile_image ? true : undefined}
								aria-describedby={
									errors.profile_image ? "apply-profile-image-error" : undefined
								}
								onChange={(event) => onChange(event.target.files?.[0])}
							/>
						)}
					/>
					<p className="career-apply-form__hint">{t("profile_image_hint")}</p>
					<FieldError
						id="apply-profile-image-error"
						message={errors.profile_image?.message}
					/>
				</div>

				<div>
					<FormLabel htmlFor="apply-resume" required>
						{t("resume")}
					</FormLabel>
					<Controller
						name="resume"
						control={control}
						render={({ field: { onChange, ref } }) => (
							<input
								id="apply-resume"
								ref={ref}
								type="file"
								accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
								className={`career-apply-form__file${errors.resume ? " career-apply-form__file--error" : ""}`}
								aria-invalid={errors.resume ? true : undefined}
								aria-describedby={
									errors.resume ? "apply-resume-error" : undefined
								}
								onChange={(event) => onChange(event.target.files?.[0])}
							/>
						)}
					/>
					<p className="career-apply-form__hint">{t("resume_hint")}</p>
					<FieldError
						id="apply-resume-error"
						message={errors.resume?.message}
					/>
				</div>
			</div>

			<div>
				<FormLabel htmlFor="apply-skills" optional={t("optional")}>
					{t("skills")}
				</FormLabel>
				<Controller
					name="skills"
					control={control}
					render={({ field }) => (
						<SkillsBadgeInput
							id="apply-skills"
							value={field.value ?? ""}
							onChange={field.onChange}
							onBlur={field.onBlur}
							placeholder={t("skills_placeholder")}
							removeLabel={t("skills_remove")}
							invalid={Boolean(errors.skills)}
							describedBy={
								errors.skills ? "apply-skills-error" : "apply-skills-hint"
							}
						/>
					)}
				/>
				<p id="apply-skills-hint" className="career-apply-form__hint">
					{t("skills_hint")}
				</p>
				<FieldError id="apply-skills-error" message={errors.skills?.message} />
			</div>

			<div>
				<FormLabel htmlFor="apply-bio" optional={t("optional")}>
					{t("bio")}
				</FormLabel>
				<textarea
					id="apply-bio"
					rows={4}
					maxLength={2000}
					placeholder={t("bio_placeholder")}
					className={`${inputClassName} min-h-[108px] resize-y${errors.bio ? ` ${inputErrorClassName}` : ""}`}
					aria-invalid={errors.bio ? true : undefined}
					aria-describedby={errors.bio ? "apply-bio-error" : undefined}
					{...register("bio")}
				/>
				<FieldError id="apply-bio-error" message={errors.bio?.message} />
			</div>

			<div>
				<FormLabel htmlFor="apply-cover-letter" optional={t("optional")}>
					{t("cover_letter")}
				</FormLabel>
				<textarea
					id="apply-cover-letter"
					rows={5}
					maxLength={5000}
					placeholder={t("cover_letter_placeholder")}
					className={`${inputClassName} min-h-[132px] resize-y${errors.cover_letter ? ` ${inputErrorClassName}` : ""}`}
					aria-invalid={errors.cover_letter ? true : undefined}
					aria-describedby={
						errors.cover_letter ? "apply-cover-letter-error" : undefined
					}
					{...register("cover_letter")}
				/>
				<FieldError
					id="apply-cover-letter-error"
					message={errors.cover_letter?.message}
				/>
			</div>

			<div className="career-apply-form__turnstile">
				<TurnstileWidget ref={turnstileRef} onTokenChange={setTurnstileToken} />
			</div>

			{submitError ? (
				<p className="career-apply-form__submit-error" role="alert">
					{submitError}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isSubmitting || (hasMounted && !turnstileToken)}
				className="career-apply-form__submit"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="size-4 animate-spin" aria-hidden />
						{t("submitting")}
					</>
				) : (
					<>
						{t("submit")}
						<ArrowRight className="size-4" aria-hidden />
					</>
				)}
			</button>
		</form>
	);
}
