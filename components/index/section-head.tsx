type SectionHeadProps = {
	headline: string;
	description?: string;
	centered?: boolean;
	className?: string;
	descriptionClassName?: string;
};

export default function SectionHead({
	headline,
	description,
	centered = false,
	className = "",
	descriptionClassName = "",
}: SectionHeadProps) {
	return (
		<div
			className={`max-w-[48rem] ${centered ? "mx-auto text-center" : ""} ${className}`}
		>
			<h2 className="section-title text-balance tracking-tight">{headline}</h2>
			{description ? (
				<p
					className={`max-w-[70ch] text-pretty leading-relaxed text-(--text) ${centered ? "mx-auto" : ""} ${descriptionClassName || "mt-5 text-base"}`}
				>
					{description}
				</p>
			) : null}
		</div>
	);
}
