"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

type DateFieldProps = {
	id: string;
	/** ISO `YYYY-MM-DD`, or empty string. */
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
	invalid?: boolean;
	describedBy?: string;
	/** Latest selectable date, ISO. */
	max?: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "long" });
const shortMonthFormat = new Intl.DateTimeFormat("en-GB", { month: "short" });
const displayFormat = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) =>
	`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (iso: string) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	return match ? new Date(+match[1], +match[2] - 1, +match[3]) : null;
};
const sameDay = (a: Date | null, b: Date | null) =>
	!!a && !!b && toIso(a) === toIso(b);
const addDays = (d: Date, n: number) =>
	new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
	const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
	const last = new Date(target.getFullYear(), target.getMonth() + 1, 0);
	target.setDate(Math.min(d.getDate(), last.getDate()));
	return target;
};

type View = "days" | "months" | "years";

export function DateField({
	id,
	value,
	onChange,
	onBlur,
	placeholder = "Select a date",
	className = "",
	invalid,
	describedBy,
	max,
}: DateFieldProps) {
	const dialogId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const selected = fromIso(value);
	const maxDate = max ? fromIso(max) : null;
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<View>("days");
	const [focus, setFocus] = useState<Date>(() => selected ?? new Date());

	useEffect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) close(false);
		};
		document.addEventListener("pointerdown", onPointer);
		return () => document.removeEventListener("pointerdown", onPointer);
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: refocus the roving day whenever it moves
	useEffect(() => {
		if (open && view === "days") {
			gridRef.current
				?.querySelector<HTMLButtonElement>('[data-focus="true"]')
				?.focus();
		}
	}, [open, view, focus]);

	const openPicker = () => {
		setFocus(selected ?? maxDate ?? new Date());
		setView("days");
		setOpen(true);
	};

	const close = (restoreFocus = true) => {
		setOpen(false);
		onBlur?.();
		if (restoreFocus) triggerRef.current?.focus();
	};

	const isDisabled = (d: Date) => !!maxDate && d > maxDate;

	const pick = (d: Date) => {
		if (isDisabled(d)) return;
		onChange(toIso(d));
		close();
	};

	const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const moves: Record<string, () => Date> = {
			ArrowLeft: () => addDays(focus, -1),
			ArrowRight: () => addDays(focus, 1),
			ArrowUp: () => addDays(focus, -7),
			ArrowDown: () => addDays(focus, 7),
			PageUp: () => addMonths(focus, event.shiftKey ? -12 : -1),
			PageDown: () => addMonths(focus, event.shiftKey ? 12 : 1),
			Home: () => addDays(focus, -((focus.getDay() + 6) % 7)),
			End: () => addDays(focus, 6 - ((focus.getDay() + 6) % 7)),
		};
		if (moves[event.key]) {
			event.preventDefault();
			setFocus(moves[event.key]());
		}
	};

	const year = focus.getFullYear();
	const month = focus.getMonth();
	const firstOfMonth = new Date(year, month, 1);
	const gridStart = addDays(firstOfMonth, -((firstOfMonth.getDay() + 6) % 7));
	const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
	const today = new Date();
	const decadeStart = year - (year % 12);

	const heading =
		view === "days"
			? `${monthFormat.format(focus)} ${year}`
			: view === "months"
				? String(year)
				: `${decadeStart} – ${decadeStart + 11}`;

	const step = (dir: 1 | -1) => {
		if (view === "days") setFocus(addMonths(focus, dir));
		else if (view === "months") setFocus(addMonths(focus, dir * 12));
		else setFocus(addMonths(focus, dir * 144));
	};

	return (
		<div
			ref={rootRef}
			className="ui-select"
			onKeyDown={(event) => {
				if (open && event.key === "Escape") {
					event.preventDefault();
					close();
				}
			}}
		>
			<button
				ref={triggerRef}
				id={id}
				type="button"
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={dialogId}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				className={`ui-select__trigger ${className}`}
				data-open={open || undefined}
				onClick={() => (open ? close() : openPicker())}
			>
				<span
					className={selected ? "truncate" : "truncate text-(--text-subtle)"}
				>
					{selected ? displayFormat.format(selected) : placeholder}
				</span>
				<CalendarDays className="ui-select__chevron" aria-hidden />
			</button>

			{open ? (
				<div
					id={dialogId}
					role="dialog"
					aria-modal="false"
					aria-label="Choose date"
					className="ui-popover ui-calendar"
				>
					<div className="ui-calendar__head">
						<button
							type="button"
							className="ui-calendar__title"
							onClick={() =>
								setView(
									view === "days"
										? "years"
										: view === "years"
											? "days"
											: "years",
								)
							}
							aria-live="polite"
						>
							{heading}
							<ChevronRight
								className="size-4 transition-transform"
								style={{ rotate: view === "days" ? "90deg" : "-90deg" }}
								aria-hidden
							/>
						</button>
						<div className="flex gap-1">
							<button
								type="button"
								className="ui-calendar__nav"
								aria-label="Previous"
								onClick={() => step(-1)}
							>
								<ChevronLeft className="size-4" aria-hidden />
							</button>
							<button
								type="button"
								className="ui-calendar__nav"
								aria-label="Next"
								onClick={() => step(1)}
							>
								<ChevronRight className="size-4" aria-hidden />
							</button>
						</div>
					</div>

					{view === "days" ? (
						<>
							<div className="ui-calendar__weekdays" aria-hidden>
								{WEEKDAYS.map((day) => (
									<span key={day}>{day}</span>
								))}
							</div>
							<div
								ref={gridRef}
								role="grid"
								className="ui-calendar__days"
								onKeyDown={onGridKeyDown}
							>
								{days.map((day) => {
									const isFocus = sameDay(day, focus);
									return (
										<button
											key={toIso(day)}
											type="button"
											tabIndex={isFocus ? 0 : -1}
											data-focus={isFocus}
											data-outside={day.getMonth() !== month || undefined}
											data-today={sameDay(day, today) || undefined}
											aria-pressed={sameDay(day, selected)}
											aria-label={displayFormat.format(day)}
											disabled={isDisabled(day)}
											className="ui-calendar__day"
											onClick={() => pick(day)}
										>
											{day.getDate()}
										</button>
									);
								})}
							</div>
						</>
					) : view === "months" ? (
						<div className="ui-calendar__cells">
							{Array.from({ length: 12 }, (_, m) => {
								const d = new Date(year, m, 1);
								return (
									<button
										key={m}
										type="button"
										className="ui-calendar__cell"
										aria-pressed={
											!!selected &&
											selected.getFullYear() === year &&
											selected.getMonth() === m
										}
										disabled={!!maxDate && d > maxDate}
										onClick={() => {
											setFocus(addMonths(focus, m - month));
											setView("days");
										}}
									>
										{shortMonthFormat.format(d)}
									</button>
								);
							})}
						</div>
					) : (
						<div className="ui-calendar__cells">
							{Array.from({ length: 12 }, (_, i) => {
								const y = decadeStart + i;
								return (
									<button
										key={y}
										type="button"
										className="ui-calendar__cell"
										aria-pressed={selected?.getFullYear() === y}
										disabled={!!maxDate && y > maxDate.getFullYear()}
										onClick={() => {
											setFocus(addMonths(focus, (y - year) * 12));
											setView("months");
										}}
									>
										{y}
									</button>
								);
							})}
						</div>
					)}

					<div className="ui-calendar__foot">
						<button
							type="button"
							className="ui-calendar__link"
							disabled={!value}
							onClick={() => {
								onChange("");
								close();
							}}
						>
							<X className="size-3.5" aria-hidden />
							Clear
						</button>
						{!maxDate || today <= maxDate ? (
							<button
								type="button"
								className="ui-calendar__link"
								onClick={() => pick(today)}
							>
								Today
							</button>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}
