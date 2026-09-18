import { z } from "zod";

/** Translated messages for job application form validation errors. */
export type JobApplicationFormMessages = {
	fullNameRequired: string;
	fullNameMax: string;
	emailRequired: string;
	emailInvalid: string;
	phoneMax: string;
	dobRequired: string;
	genderRequired: string;
	profileImageRequired: string;
	resumeRequired: string;
	bioMax: string;
	coverLetterMax: string;
	skillsMax: string;
	experienceCompanyRequired: string;
	experiencePositionRequired: string;
	experienceDateInvalid: string;
	experienceDescriptionMax: string;
	educationInstitutionRequired: string;
	educationDegreeRequired: string;
	educationDateInvalid: string;
	projectNameRequired: string;
	projectUrlInvalid: string;
	projectDescriptionMax: string;
};

/** Flags indicating which optional fields are required for a specific job. */
type JobRequirementFlags = {
	isDobRequired: boolean;
	isGenderRequired: boolean;
};

const optionalDate = (message: string) =>
	z
		.string()
		.trim()
		.refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
			message,
		})
		.optional();

const text = (message: string) =>
	z.string().trim().min(1, message).max(191, message);

const entrySchemas = (messages: JobApplicationFormMessages) => ({
	experience: z.object({
		company_name: text(messages.experienceCompanyRequired),
		position: text(messages.experiencePositionRequired),
		start_date: optionalDate(messages.experienceDateInvalid),
		end_date: optionalDate(messages.experienceDateInvalid),
		description: z
			.string()
			.trim()
			.max(2000, messages.experienceDescriptionMax)
			.optional(),
	}),
	education: z.object({
		institution_name: text(messages.educationInstitutionRequired),
		degree: text(messages.educationDegreeRequired),
		start_date: optionalDate(messages.educationDateInvalid),
		end_date: optionalDate(messages.educationDateInvalid),
	}),
	project: z.object({
		project_name: text(messages.projectNameRequired),
		project_url: z
			.url(messages.projectUrlInvalid)
			.max(500, messages.projectUrlInvalid),
		description: z
			.string()
			.trim()
			.max(2000, messages.projectDescriptionMax)
			.optional(),
	}),
});

/**
 * Filter out rows the user added but left completely blank, so an untouched
 * row never blocks submission. Non-blank rows are validated normally.
 */
const isRowBlank = (entry: unknown, keys: string[]) =>
	typeof entry === "object" &&
	entry !== null &&
	keys.every(
		(key) => !String((entry as Record<string, unknown>)[key] ?? "").trim(),
	);

/**
 * Creates a Zod validation schema for the job application form.
 *
 * @param flags - Job-specific requirement flags
 * @param messages - Translated validation messages
 * @returns Zod schema for job application form values
 */
export function createJobApplicationSchema(
	flags: JobRequirementFlags,
	messages: JobApplicationFormMessages,
) {
	const schemas = entrySchemas(messages);

	return z
		.object({
			full_name: z
				.string()
				.trim()
				.min(1, messages.fullNameRequired)
				.max(100, messages.fullNameMax),
			email: z
				.string()
				.trim()
				.min(1, messages.emailRequired)
				.email(messages.emailInvalid),
			phone: z.string().trim().max(30, messages.phoneMax).optional(),
			date_of_birth: z.string().optional(),
			gender: z.string().optional(),
			bio: z.string().trim().max(2000, messages.bioMax).optional(),
			cover_letter: z
				.string()
				.trim()
				.max(5000, messages.coverLetterMax)
				.optional(),
			skills: z.string().trim().max(500, messages.skillsMax).optional(),
			experiences: z
				.array(
					schemas.experience.transform((row) =>
						isRowBlank(row, [
							"company_name",
							"position",
							"start_date",
							"end_date",
							"description",
						])
							? undefined
							: row,
					),
				)
				.max(20)
				.transform((rows) =>
					rows.filter((row): row is NonNullable<typeof row> => row != null),
				)
				.optional(),
			educations: z
				.array(
					schemas.education.transform((row) =>
						isRowBlank(row, [
							"institution_name",
							"degree",
							"start_date",
							"end_date",
						])
							? undefined
							: row,
					),
				)
				.max(20)
				.transform((rows) =>
					rows.filter((row): row is NonNullable<typeof row> => row != null),
				)
				.optional(),
			projects: z
				.array(
					schemas.project.transform((row) =>
						isRowBlank(row, ["project_name", "project_url", "description"])
							? undefined
							: row,
					),
				)
				.max(20)
				.transform((rows) =>
					rows.filter((row): row is NonNullable<typeof row> => row != null),
				)
				.optional(),
			profile_image: z
				.custom<File>(
					(value) => value instanceof File && value.size > 0,
					messages.profileImageRequired,
				)
				.optional(),
			resume: z
				.custom<File>(
					(value) => value instanceof File && value.size > 0,
					messages.resumeRequired,
				)
				.optional(),
		})
		.superRefine((data, ctx) => {
			if (!data.profile_image) {
				ctx.addIssue({
					code: "custom",
					path: ["profile_image"],
					message: messages.profileImageRequired,
				});
			}

			if (!data.resume) {
				ctx.addIssue({
					code: "custom",
					path: ["resume"],
					message: messages.resumeRequired,
				});
			}

			if (flags.isDobRequired && !data.date_of_birth?.trim()) {
				ctx.addIssue({
					code: "custom",
					path: ["date_of_birth"],
					message: messages.dobRequired,
				});
			}

			if (flags.isGenderRequired && !data.gender?.trim()) {
				ctx.addIssue({
					code: "custom",
					path: ["gender"],
					message: messages.genderRequired,
				});
			}
		});
}

/**
 * The zod schema has a different input (unknown — rows may be raw DOM values)
 * than its output (validated form values), so the RHF resolver needs the
 * three-type-parameter form: <input, context, output>.
 */
export type JobApplicationFormValues = z.infer<
	ReturnType<typeof createJobApplicationSchema>
>;
