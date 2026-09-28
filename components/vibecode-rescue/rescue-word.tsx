"use client";

import { type CSSProperties, useCallback, useEffect, useState } from "react";

const COLS = 4;
const ROWS = 5;
const CELL_COUNT = COLS * ROWS;

const LETTERS = ["R", "E", "S", "C", "U", "E"] as const;

type Offset = { x: number; y: number; r: number };

const SHIFTS: Offset[] = [
	{ x: 6, y: -5, r: 6 },
	{ x: -6, y: 5, r: -7 },
	{ x: 5, y: 6, r: 5 },
	{ x: -7, y: -4, r: -5 },
	{ x: 4, y: -6, r: 7 },
	{ x: -5, y: 4, r: -4 },
];

function fragmentOffset(letter: string, index: number): Offset | null {
	const seed =
		(letter.charCodeAt(0) * 19 + index * 13 + letter.length * 7) % 10;
	if (seed < 7) return null;
	return SHIFTS[seed % SHIFTS.length];
}

function RescueLetter({
	char,
	open,
	onToggle,
}: {
	char: string;
	open: boolean;
	onToggle: () => void;
}) {
	return (
		<span
			className={open ? "vcr-letter is-open" : "vcr-letter"}
			aria-hidden
			onClick={onToggle}
		>
			<span className="vcr-letter__solid">{char}</span>
			{Array.from({ length: CELL_COUNT }, (_, index) => {
				const col = index % COLS;
				const row = Math.floor(index / COLS);
				const move = fragmentOffset(char, index);

				return (
					<span
						key={`${char}-${index}`}
						className={move ? "vcr-frag vcr-frag--loose" : "vcr-frag"}
						style={
							{
								"--c": col,
								"--r": row,
								"--dx": move ? `${move.x}px` : "0px",
								"--dy": move ? `${move.y}px` : "0px",
								"--dr": move ? `${move.r}deg` : "0deg",
							} as CSSProperties
						}
					>
						<span className="vcr-frag__glyph">{char}</span>
					</span>
				);
			})}
		</span>
	);
}

export function RescueWord() {
	const [active, setActive] = useState<number | null>(null);
	const [canHover, setCanHover] = useState(true);

	useEffect(() => {
		const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
		const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setCanHover(hoverMq.matches && !motionMq.matches);
		sync();
		hoverMq.addEventListener("change", sync);
		motionMq.addEventListener("change", sync);
		return () => {
			hoverMq.removeEventListener("change", sync);
			motionMq.removeEventListener("change", sync);
		};
	}, []);

	const toggle = useCallback(
		(index: number) => {
			if (canHover) return;
			setActive((current) => (current === index ? null : index));
		},
		[canHover],
	);

	return (
		<div className="vcr-word" role="img" aria-label="RESCUE">
			{LETTERS.map((letter, index) => (
				<RescueLetter
					key={`${letter}-${index}`}
					char={letter}
					open={active === index}
					onToggle={() => toggle(index)}
				/>
			))}
		</div>
	);
}
