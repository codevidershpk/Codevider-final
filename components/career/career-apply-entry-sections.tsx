"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type {
	FieldErrors,
	UseFieldArrayReturn,
	UseFormRegister,
	UseFormWatch,
} from "react-hook-form";
import type { JobApplicationFormValues } from "@/lib/schemas/job-application";

const inputClassName =
	"w-full rounded-[10px] border-[1.5px] border-(--border) bg-(--bg) px-4 py-3 text-sm text-inherit placeholder:text-(--text-subtle) transition-[border-color,box-shadow] focus:border-(--dash-brand) focus:outline-none focus-visible:ring-[3px] focus-visible:ring-(--dash-brand)/15";

type Translate = (key: string) => string;

type SectionKey = "experiences" | "educations" | "projects";

/** Keys that decide whether a row counts as "filled" for the add guard. */
const ROW_KEYS: Record<SectionKey, string[]> = {
	experiences: [
		"company_name",
		"position",
		"start_date",
		"end_date",
		"description",
	],
	educations: ["institution_name", "degree", "start_date", "end_date"],
	projects: ["project_name", "project_url", "description"],
};

const isRowBlank = (row: unknown, keys: string[]) =>
	typeof row === "object" &&
	row !== null &&
	keys.every(
		(key) => !String((row as Record<string, unknown>)[key] ?? "").trim(),
	);

function EntryLabel({
	htmlFor,
	children,
	optional,
}: {
	htmlFor: string;
	children: ReactNode;
	optional?: string;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="mb-1.5 block text-xs font-medium text-(--text)"
		>
			<span>{children}</span>
			{optional ? (
				<span className="ml-1 font-normal text-(--text-subtle)">
					({optional})
				</span>
			) : null}
		</label>
	);
}

function EntryError({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<p className="mt-1 text-xs text-(--dash-warning)" role="alert">
			{message}
		</p>
	);
}

function Section({
	title,
	addLabel,
	onAdd,
	canAdd,
	count,
	optionalLabel,
	children,
}: {
	title: string;
	addLabel: string;
	onAdd: () => void;
	/** False when the last row is still blank — clicking add does nothing. */
	canAdd: boolean;
	count: number;
	optionalLabel: string;
	children: ReactNode;
}) {
	return (
		<div
			className="career-apply-form__opt-section"
			data-open={count > 0 || undefined}
		>
			<div className="career-apply-form__opt-toggle">
				<span className="career-apply-form__opt-title">
					{title}
					<span className="career-apply-form__opt-optional">
						({optionalLabel})
					</span>
					{count > 0 ? (
						<span className="career-apply-form__opt-count">{count}</span>
					) : null}
				</span>
				<button
					type="button"
					className="career-apply-form__opt-add"
					aria-label={addLabel}
					disabled={!canAdd}
					onClick={onAdd}
				>
					<Plus className="size-4" strokeWidth={2.5} aria-hidden />
				</button>
			</div>

			{count > 0 ? (
				<div className="career-apply-form__opt-body">
					<div className="career-apply-form__entries">{children}</div>
				</div>
			) : null}
		</div>
	);
}

function EntryCard({
	legend,
	onRemove,
	removeLabel,
	children,
}: {
	legend: string;
	onRemove: () => void;
	removeLabel: string;
	children: ReactNode;
}) {
	return (
		<fieldset className="career-apply-form__entry">
			<legend className="sr-only">{legend}</legend>
			<button
				type="button"
				className="career-apply-form__entry-remove"
				aria-label={removeLabel}
				onClick={onRemove}
			>
				<Trash2 className="size-3.5" aria-hidden />
			</button>
			<div className="career-apply-form__grid">{children}</div>
		</fieldset>
	);
}

export type EntrySectionsProps = {
	register: UseFormRegister<JobApplicationFormValues>;
	watch: UseFormWatch<JobApplicationFormValues>;
	errors: FieldErrors<JobApplicationFormValues>;
	experienceFields: UseFieldArrayReturn<
		JobApplicationFormValues,
		"experiences"
	>;
	educationFields: UseFieldArrayReturn<JobApplicationFormValues, "educations">;
	projectFields: UseFieldArrayReturn<JobApplicationFormValues, "projects">;
	t: Translate;
};

export default function CareerApplyEntrySections({
	register,
	watch,
	errors,
	experienceFields,
	educationFields,
	projectFields,
	t,
}: EntrySectionsProps) {
	// Watch live row values so we can disable "add" while the last row is blank.
	const experiences = watch("experiences") ?? [];
	const educations = watch("educations") ?? [];
	const projects = watch("projects") ?? [];

	const lastRowBlank = (
		rows: unknown[] | undefined,
		section: SectionKey,
	): boolean => {
		if (!rows?.length) return false;
		return isRowBlank(rows[rows.length - 1], ROW_KEYS[section]);
	};

	return (
		<div className="career-apply-form__opt-group">
			<Section
				title={t("experience_title")}
				addLabel={t("add_experience")}
				optionalLabel={t("optional")}
				count={experienceFields.fields.length}
				canAdd={!lastRowBlank(experiences, "experiences")}
				onAdd={() =>
					experienceFields.append({
						company_name: "",
						position: "",
						start_date: "",
						end_date: "",
						description: "",
					})
				}
			>
				{experienceFields.fields.map((field, index) => (
					<EntryCard
						key={field.id}
						legend={`${t("experience_title")} ${index + 1}`}
						removeLabel={t("remove_entry")}
						onRemove={() => experienceFields.remove(index)}
					>
						<div>
							<EntryLabel htmlFor={`apply-exp-${index}-company`}>
								{t("company_name")}
							</EntryLabel>
							<input
								id={`apply-exp-${index}-company`}
								type="text"
								className={inputClassName}
								{...register(`experiences.${index}.company_name` as const)}
							/>
							<EntryError
								message={errors.experiences?.[index]?.company_name?.message}
							/>
						</div>
						<div>
							<EntryLabel htmlFor={`apply-exp-${index}-position`}>
								{t("position")}
							</EntryLabel>
							<input
								id={`apply-exp-${index}-position`}
								type="text"
								className={inputClassName}
								{...register(`experiences.${index}.position` as const)}
							/>
							<EntryError
								message={errors.experiences?.[index]?.position?.message}
							/>
						</div>
						<div>
							<EntryLabel
								htmlFor={`apply-exp-${index}-start`}
								optional={t("optional")}
							>
								{t("start_date")}
							</EntryLabel>
							<input
								id={`apply-exp-${index}-start`}
								type="date"
								className={inputClassName}
								{...register(`experiences.${index}.start_date` as const)}
							/>
							<EntryError
								message={errors.experiences?.[index]?.start_date?.message}
							/>
						</div>
						<div>
							<EntryLabel
								htmlFor={`apply-exp-${index}-end`}
								optional={t("optional")}
							>
								{t("end_date")}
							</EntryLabel>
							<input
								id={`apply-exp-${index}-end`}
								type="date"
								className={inputClassName}
								{...register(`experiences.${index}.end_date` as const)}
							/>
							<EntryError
								message={errors.experiences?.[index]?.end_date?.message}
							/>
						</div>
						<div className="sm:col-span-2">
							<EntryLabel
								htmlFor={`apply-exp-${index}-desc`}
								optional={t("optional")}
							>
								{t("description")}
							</EntryLabel>
							<textarea
								id={`apply-exp-${index}-desc`}
								rows={2}
								className={`${inputClassName} min-h-[72px] resize-y`}
								{...register(`experiences.${index}.description` as const)}
							/>
							<EntryError
								message={errors.experiences?.[index]?.description?.message}
							/>
						</div>
					</EntryCard>
				))}
			</Section>
			<Section
				title={t("education_title")}
				addLabel={t("add_education")}
				optionalLabel={t("optional")}
				canAdd={!lastRowBlank(educations, "educations")}
				count={educationFields.fields.length}
				onAdd={() =>
					educationFields.append({
						institution_name: "",
						degree: "",
						start_date: "",
						end_date: "",
					})
				}
			>
				{educationFields.fields.map((field, index) => (
					<EntryCard
						key={field.id}
						legend={`${t("education_title")} ${index + 1}`}
						removeLabel={t("remove_entry")}
						onRemove={() => educationFields.remove(index)}
					>
						<div>
							<EntryLabel htmlFor={`apply-edu-${index}-inst`}>
								{t("institution_name")}
							</EntryLabel>
							<input
								id={`apply-edu-${index}-inst`}
								type="text"
								className={inputClassName}
								{...register(`educations.${index}.institution_name` as const)}
							/>
							<EntryError
								message={errors.educations?.[index]?.institution_name?.message}
							/>
						</div>
						<div>
							<EntryLabel htmlFor={`apply-edu-${index}-degree`}>
								{t("degree")}
							</EntryLabel>
							<input
								id={`apply-edu-${index}-degree`}
								type="text"
								className={inputClassName}
								{...register(`educations.${index}.degree` as const)}
							/>
							<EntryError
								message={errors.educations?.[index]?.degree?.message}
							/>
						</div>
						<div>
							<EntryLabel
								htmlFor={`apply-edu-${index}-start`}
								optional={t("optional")}
							>
								{t("start_date")}
							</EntryLabel>
							<input
								id={`apply-edu-${index}-start`}
								type="date"
								className={inputClassName}
								{...register(`educations.${index}.start_date` as const)}
							/>
							<EntryError
								message={errors.educations?.[index]?.start_date?.message}
							/>
						</div>
						<div>
							<EntryLabel
								htmlFor={`apply-edu-${index}-end`}
								optional={t("optional")}
							>
								{t("end_date")}
							</EntryLabel>
							<input
								id={`apply-edu-${index}-end`}
								type="date"
								className={inputClassName}
								{...register(`educations.${index}.end_date` as const)}
							/>
							<EntryError
								message={errors.educations?.[index]?.end_date?.message}
							/>
						</div>
					</EntryCard>
				))}
			</Section>

			<Section
				title={t("projects_title")}
				addLabel={t("add_project")}
				optionalLabel={t("optional")}
				canAdd={!lastRowBlank(projects, "projects")}
				count={projectFields.fields.length}
				onAdd={() =>
					projectFields.append({
						project_name: "",
						project_url: "",
						description: "",
					})
				}
			>
				{projectFields.fields.map((field, index) => (
					<EntryCard
						key={field.id}
						legend={`${t("projects_title")} ${index + 1}`}
						removeLabel={t("remove_entry")}
						onRemove={() => projectFields.remove(index)}
					>
						<div>
							<EntryLabel htmlFor={`apply-proj-${index}-name`}>
								{t("project_name")}
							</EntryLabel>
							<input
								id={`apply-proj-${index}-name`}
								type="text"
								className={inputClassName}
								{...register(`projects.${index}.project_name` as const)}
							/>
							<EntryError
								message={errors.projects?.[index]?.project_name?.message}
							/>
						</div>
						<div>
							<EntryLabel htmlFor={`apply-proj-${index}-url`}>
								{t("project_url")}
							</EntryLabel>
							<input
								id={`apply-proj-${index}-url`}
								type="url"
								className={inputClassName}
								{...register(`projects.${index}.project_url` as const)}
							/>
							<EntryError
								message={errors.projects?.[index]?.project_url?.message}
							/>
						</div>
						<div className="sm:col-span-2">
							<EntryLabel
								htmlFor={`apply-proj-${index}-desc`}
								optional={t("optional")}
							>
								{t("description")}
							</EntryLabel>
							<textarea
								id={`apply-proj-${index}-desc`}
								rows={2}
								className={`${inputClassName} min-h-[72px] resize-y`}
								{...register(`projects.${index}.description` as const)}
							/>
							<EntryError
								message={errors.projects?.[index]?.description?.message}
							/>
						</div>
					</EntryCard>
				))}
			</Section>
		</div>
	);
}
