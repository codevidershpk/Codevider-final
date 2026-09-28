"use client";

import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

const COLS = 4;
const ROWS = 5;
const CELL_COUNT = COLS * ROWS;

const LETTERS = ["R", "E", "S", "C", "U", "E"] as const;

// How long every letter stays broken before the first one snaps back.
const HOLD_MS = 700;
// Delay between each letter reassembling, left to right.
const STAGGER_MS = 160;
// Play once on load, after the hero copy has faded in.
const INTRO_DELAY_MS = 1400;

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
	className = "",
}: {
	char: string;
	open: boolean;
	className?: string;
}) {
	return (
		<span
			className={`vcr-letter${open ? " is-open" : ""} ${className}`.trim()}
			aria-hidden
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
	const [broken, setBroken] = useState<boolean[]>(() =>
		LETTERS.map(() => false),
	);
	const running = useRef(false);
	const timers = useRef<number[]>([]);

	const shatter = useCallback(() => {
		if (running.current) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		running.current = true;
		setBroken(LETTERS.map(() => true));

		timers.current = LETTERS.map((_, index) =>
			window.setTimeout(
				() => {
					setBroken((current) =>
						current.map((value, i) => (i === index ? false : value)),
					);
					if (index === LETTERS.length - 1) running.current = false;
				},
				HOLD_MS + index * STAGGER_MS,
			),
		);
	}, []);

	useEffect(() => {
		const intro = window.setTimeout(shatter, INTRO_DELAY_MS);
		return () => {
			window.clearTimeout(intro);
			for (const id of timers.current) window.clearTimeout(id);
			running.current = false;
		};
	}, [shatter]);

	return (
		<div
			className="vcr-word"
			role="img"
			aria-label="RESCUE"
			onPointerEnter={shatter}
			onClick={shatter}
		>
			{LETTERS.map((letter, index) => (
				<RescueLetter
					key={`${letter}-${index}`}
					char={letter}
					open={broken[index]}
					// The round C–U pair reads tighter than the rest; open it up.
					className={letter === "U" ? "vcr-letter--loose-start" : undefined}
				/>
			))}
		</div>
	);
}
