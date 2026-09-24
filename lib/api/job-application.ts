import { getBackendUrl } from "@/lib/api/backend";
import type {
	JobApplicationPayload,
	JobApplicationUploadResponse,
} from "@/lib/types/job-application";

/**
 * Custom error class for job application-related errors.
 * Includes HTTP status code and optional backend-provided detail messages
 * so the UI can surface validation feedback instead of generic errors.
 */
export class JobApplicationError extends Error {
	status: number;
	details: string[];

	constructor(message: string, status: number, details: string[] = []) {
		super(message);
		this.name = "JobApplicationError";
		this.status = status;
		this.details = details;
	}
}

/**
 * Extracts human-readable validation messages from a backend error payload.
 *
 * @param payload - Parsed JSON error body
 * @returns List of detail messages, empty when none present
 */
function extractErrorDetails(payload: unknown): string[] {
	if (typeof payload !== "object" || payload === null) return [];
	const details = (payload as { errorDetails?: unknown }).errorDetails;
	if (typeof details === "string") return [details];
	if (typeof details !== "object" || details === null) return [];
	const message = (details as { message?: unknown }).message;
	if (typeof message === "string") return [message];
	if (Array.isArray(message)) {
		return message.filter(
			(entry): entry is string => typeof entry === "string",
		);
	}
	return [];
}

/**
 * Reads the backend error body (when present) for status + details.
 *
 * @param response - Failed fetch response
 * @param fallback - Fallback error code when the body is unreadable
 * @returns JobApplicationError with backend details attached
 */
async function toJobApplicationError(
	response: Response,
	fallback: "upload_failed" | "submit_failed",
): Promise<JobApplicationError> {
	try {
		const payload = await response.json();
		return new JobApplicationError(
			fallback,
			response.status,
			extractErrorDetails(payload),
		);
	} catch {
		return new JobApplicationError(fallback, response.status);
	}
}

/**
 * Uploads job application files (profile image and/or resume) to the backend.
 * Either file may be omitted when the job does not require it — at least one
 * file must be provided.
 *
 * @param profileImage - Profile image file (optional)
 * @param resume - Resume file (optional)
 * @returns Uploaded file metadata (null for files that were not uploaded)
 * @throws JobApplicationError If upload fails
 */
export async function uploadJobApplicationFiles(
	profileImage?: File,
	resume?: File,
): Promise<JobApplicationUploadResponse> {
	const formData = new FormData();
	if (profileImage) formData.append("profile_image", profileImage);
	if (resume) formData.append("resume", resume);

	const response = await fetch(
		`${getBackendUrl()}/landing-page/recruit/candidate/job-application/upload`,
		{
			method: "POST",
			body: formData,
		},
	);

	if (!response.ok) {
		throw await toJobApplicationError(response, "upload_failed");
	}

	return response.json() as Promise<JobApplicationUploadResponse>;
}

/**
 * Submits a complete job application directly to the Nest backend.
 * Validation is handled client-side with Zod + react-hook-form.
 *
 * @param payload - Full job application payload with uploaded file metadata
 * @param turnstileToken - Cloudflare Turnstile verification token
 * @throws JobApplicationError If submission fails
 */
export async function submitJobApplication(
	payload: JobApplicationPayload,
	turnstileToken: string,
): Promise<void> {
	const response = await fetch(
		`${getBackendUrl()}/landing-page/recruit/candidate/job-application`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...payload,
				turnstileToken,
			}),
		},
	);

	if (!response.ok) {
		throw await toJobApplicationError(response, "submit_failed");
	}
}
