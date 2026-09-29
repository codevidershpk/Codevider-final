"use client";

import { Check, ChevronDown } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	options: SelectOption[];
	placeholder: string;
	className?: string;
	invalid?: boolean;
	describedBy?: string;
};

export function SelectField({
	id,
	value,
	onChange,
	onBlur,
	options,
	placeholder,
	className = "",
	invalid,
	describedBy,
}: SelectFieldProps) {
	const listId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const selected = options.find((option) => option.value === value);

	useEffect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
				onBlur?.();
			}
		};
		document.addEventListener("pointerdown", onPointer);
		return () => document.removeEventListener("pointerdown", onPointer);
	}, [open, onBlur]);

	const openList = () => {
		const index = options.findIndex((option) => option.value === value);
		setActive(index < 0 ? 0 : index);
		setOpen(true);
	};

	const choose = (index: number) => {
		onChange(options[index].value);
		setOpen(false);
		triggerRef.current?.focus();
	};

	const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (!open) {
			if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
				event.preventDefault();
				openList();
			}
			return;
		}
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				setActive((i) => Math.min(i + 1, options.length - 1));
				break;
			case "ArrowUp":
				event.preventDefault();
				setActive((i) => Math.max(i - 1, 0));
				break;
			case "Home":
				event.preventDefault();
				setActive(0);
				break;
			case "End":
				event.preventDefault();
				setActive(options.length - 1);
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				choose(active);
				break;
			case "Escape":
				event.preventDefault();
				setOpen(false);
				break;
			case "Tab":
				setOpen(false);
				break;
		}
	};

	return (
		<div ref={rootRef} className="ui-select">
			<button
				ref={triggerRef}
				id={id}
				type="button"
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-activedescendant={open ? `${listId}-${active}` : undefined}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				className={`ui-select__trigger ${className}`}
				data-open={open || undefined}
				onClick={() => (open ? setOpen(false) : openList())}
				onKeyDown={onKeyDown}
				onBlur={() => !open && onBlur?.()}
			>
				<span
					className={selected ? "truncate" : "truncate text-(--text-subtle)"}
				>
					{selected?.label ?? placeholder}
				</span>
				<ChevronDown className="ui-select__chevron" aria-hidden />
			</button>
			{open ? (
				<ul id={listId} role="listbox" className="ui-popover ui-select__list">
					{options.map((option, index) => {
						const isSelected = option.value === value;
						return (
							<li
								key={option.value}
								id={`${listId}-${index}`}
								role="option"
								aria-selected={isSelected}
								data-active={index === active || undefined}
								className="ui-select__option"
								onPointerEnter={() => setActive(index)}
								onPointerDown={(event) => event.preventDefault()}
								onClick={() => choose(index)}
							>
								<span>{option.label}</span>
								{isSelected ? (
									<Check className="size-4 text-(--dash-brand)" aria-hidden />
								) : null}
							</li>
						);
					})}
				</ul>
			) : null}
		</div>
	);
}
