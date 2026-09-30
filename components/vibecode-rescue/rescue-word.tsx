"use client";

import {
	type CSSProperties,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

const COLS = 4;
const ROWS = 5;
const CELL_COUNT = COLS * ROWS;

const LETTERS = ["R", "E", "S", "C", "U", "E"] as const;

// How long every letter stays broken before the first one snaps back
// (intro and taps; mouse hover holds until the pointer leaves).
const HOLD_MS = 700;
// Delay between each letter reassembling, right to left (last letter first).
const STAGGER_MS = 160;
// Play once on load, after the hero copy has faded in.
const INTRO_DELAY_MS = 1400;

type Offset = { x: number; y: number; r: number };

// Deterministic 0..1 hash so server and client render the same split.
function hash(letter: string, index: number, salt: number): number {
	const n =
		Math.sin(letter.charCodeAt(0) * 12.9898 + index * 78.233 + salt * 37.719) *
		43758.5453;
	return n - Math.floor(n);
}

// Every tile drifts outward from the letter's centre; most tiles break
// loose and fly further with a spin, so the split reads as a real fracture.
function fragmentOffset(
	letter: string,
	index: number,
	topHeavy = false,
	heavy = false,
): Offset & { loose: boolean } {
	const col = index % COLS;
	const row = Math.floor(index / COLS);
	const dx = col - (COLS - 1) / 2;
	const dy = row - (ROWS - 1) / 2;
	const len = Math.hypot(dx, dy) || 1;
	// The "ES" pair shatters harder across its top two rows; the last E
	// shatters harder all over. The R sits between the two, with its top-left
	// corner hit hardest.
	const boost = heavy || (topHeavy && row < 2);
	const isR = boost && letter === "R";
	const corner = isR && row < 2 && col < 2;
	const loose =
		hash(letter, index, 1) < (corner ? 1 : isR ? 0.8 : boost ? 0.75 : 0.38);
	const push = loose
		? (corner ? 15 : isR ? 11 : boost ? 10 : 6) +
			hash(letter, index, 2) * (corner ? 12 : isR ? 10 : boost ? 10 : 8)
		: 2;
	const jitter =
		(hash(letter, index, 3) - 0.5) * (loose ? (corner ? 7 : 5) : 1);
	const spin = loose
		? (hash(letter, index, 4) - 0.5) *
			(corner ? 64 : isR ? 48 : boost ? 44 : 30)
		: (hash(letter, index, 5) - 0.5) * 4;
	return {
		x: Math.round(((dx / len) * push + jitter) * 10) / 10,
		y: Math.round(((dy / len) * push - jitter) * 10) / 10,
		r: Math.round(spin),
		loose,
	};
}

function RescueLetter({
	char,
	open,
	topHeavy = false,
	heavy = false,
	className = "",
}: {
	char: string;
	open: boolean;
	topHeavy?: boolean;
	heavy?: boolean;
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
				const move = fragmentOffset(char, index, topHeavy, heavy);

				return (
					<span
						key={`${char}-${index}`}
						className={move.loose ? "vcr-frag vcr-frag--loose" : "vcr-frag"}
						style={
							{
								"--c": col,
								"--r": row,
								"--dx": `${move.x}px`,
								"--dy": `${move.y}px`,
								"--dr": `${move.r}deg`,
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

const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function RescueWord() {
	const [broken, setBroken] = useState<boolean[]>(() =>
		LETTERS.map(() => false),
	);
	const hovering = useRef(false);
	const timers = useRef<number[]>([]);

	const clearTimers = useCallback(() => {
		for (const id of timers.current) window.clearTimeout(id);
		timers.current = [];
	}, []);

	// Snap letters back one by one, last letter first.
	const reassemble = useCallback(
		(holdMs: number) => {
			clearTimers();
			timers.current = LETTERS.map((_, index) =>
				window.setTimeout(
					() =>
						setBroken((current) =>
							current.map((value, i) => (i === index ? false : value)),
						),
					holdMs + (LETTERS.length - 1 - index) * STAGGER_MS,
				),
			);
		},
		[clearTimers],
	);

	const breakAll = useCallback(() => {
		if (reducedMotion()) return false;
		clearTimers();
		setBroken(LETTERS.map(() => true));
		return true;
	}, [clearTimers]);

	// One-shot: break, hold, reassemble (intro and taps).
	const shatter = useCallback(() => {
		if (breakAll() && !hovering.current) reassemble(HOLD_MS);
	}, [breakAll, reassemble]);

	const onEnter = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType !== "mouse") return;
		hovering.current = true;
		breakAll();
	};

	const onLeave = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType !== "mouse") return;
		hovering.current = false;
		reassemble(0);
	};

	useEffect(() => {
		const intro = window.setTimeout(shatter, INTRO_DELAY_MS);
		return () => {
			window.clearTimeout(intro);
			clearTimers();
		};
	}, [shatter, clearTimers]);

	return (
		<div
			className="vcr-word"
			role="img"
			aria-label="RESCUE"
			onPointerEnter={onEnter}
			onPointerLeave={onLeave}
			onClick={() => {
				if (!hovering.current) shatter();
			}}
		>
			{LETTERS.map((letter, index) => (
				<RescueLetter
					key={`${letter}-${index}`}
					char={letter}
					topHeavy={index === 1 || index === 2}
					heavy={index === 0 || index === LETTERS.length - 1}
					open={broken[index]}
					// The round C–U pair reads tighter than the rest; open it up.
					className={letter === "U" ? "vcr-letter--loose-start" : undefined}
				/>
			))}
		</div>
	);
}
