import { getBackendUrl } from "@/lib/api/backend";
import type { ContactFormValues } from "@/lib/schemas/contact";

/**
 * Submits a contact form lead directly to the Nest backend.
 * Validation is handled client-side with Zod + react-hook-form.
 *
 * @param data - Validated contact form values
 * @param turnstileToken - Cloudflare Turnstile verification token
 * @throws If submission fails
 */
export async function submitContactLead(
	data: ContactFormValues,
	turnstileToken: string,
): Promise<void> {
	const response = await fetch(
		`${getBackendUrl()}/landing-page/leads/contact`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: data.name,
				email: data.email,
				details: data.details,
				turnstileToken,
			}),
		},
	);

	if (!response.ok) {
		throw new Error(`Contact lead submission failed (${response.status})`);
	}
}

export interface UkContactLeadValues {
	name: string;
	email: string;
	company?: string;
	role?: string;
	interest: "fix" | "expand" | "automate" | "not-sure";
	problem: string;
	timeline?: string;
	budget?: string;
	phone?: string;
}

/**
 * Submits the /uk page form to its dedicated backend endpoint.
 * The backend tags these leads as LinkedIn so they show in the CRM's UK tab.
 *
 * @param data - Validated UK form values
 * @param turnstileToken - Cloudflare Turnstile verification token
 * @throws If submission fails
 */
export async function submitUkContactLead(
	data: UkContactLeadValues,
	turnstileToken: string,
): Promise<void> {
	const response = await fetch(
		`${getBackendUrl()}/landing-page/leads/uk/contact`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...data, turnstileToken }),
		},
	);

	if (!response.ok) {
		throw new Error(`UK contact lead submission failed (${response.status})`);
	}
}
