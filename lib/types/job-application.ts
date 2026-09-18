/** Type representing a file uploaded to the backend. */
export type UploadedFile = {
	filename: string;
	relativepath: string;
	hashname: string;
	size: number;
};

/** Response type from file upload endpoint for job application. */
export type JobApplicationUploadResponse = {
	profile_image: UploadedFile;
	resume: UploadedFile;
};

/** Type representing work experience for a job application. */
export type JobApplicationExperience = {
	company_name: string;
	position: string;
	start_date?: string;
	end_date?: string;
	description?: string;
};

/** Type representing education history for a job application. */
export type JobApplicationEducation = {
	institution_name: string;
	degree: string;
	start_date?: string;
	end_date?: string;
};

/** Type representing a project for a job application. */
export type JobApplicationProject = {
	project_name: string;
	project_url: string;
	description?: string;
};

/** Full payload for submitting a job application to the backend. */
export type JobApplicationPayload = {
	full_name: string;
	email: string;
	job_id: number;
	phone?: string;
	date_of_birth?: string;
	gender?: string;
	photo: UploadedFile;
	resume: UploadedFile;
	bio?: string;
	cover_letter?: string;
	skills?: string[];
	experiences: JobApplicationExperience[];
	educations: JobApplicationEducation[];
	projects: JobApplicationProject[];
};
