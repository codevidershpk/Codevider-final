/**
 * Waits until `document.body.scrollHeight` stays unchanged for `stableFor` ms.
 * Resolves early when `signal` aborts or after `timeout`.
 */
export function waitForStableLayout(
	stableFor = 200,
	checkEvery = 50,
	timeout = 3000,
	signal?: AbortSignal,
): Promise<void> {
	return new Promise((resolve) => {
		if (signal?.aborted) {
			resolve();
			return;
		}

		let lastHeight = document.body.scrollHeight;
		let stableTime = 0;

		const finish = () => {
			clearInterval(interval);
			clearTimeout(timer);
			resolve();
		};

		const interval = setInterval(() => {
			if (signal?.aborted) {
				finish();
				return;
			}

			const currentHeight = document.body.scrollHeight;

			if (currentHeight === lastHeight) {
				stableTime += checkEvery;

				if (stableTime >= stableFor) {
					finish();
				}
			} else {
				stableTime = 0;
				lastHeight = currentHeight;
			}
		}, checkEvery);

		const timer = setTimeout(finish, timeout);

		signal?.addEventListener("abort", finish, { once: true });
	});
}

function isHashTargetReady(el: HTMLElement): boolean {
	return el.childElementCount > 0;
}

/**
 * Polls until a hash target exists and its deferred content has mounted.
 */
export function waitForHashTarget(
	id: string,
	checkEvery = 50,
	timeout = 8000,
	signal?: AbortSignal,
): Promise<HTMLElement | null> {
	return new Promise((resolve) => {
		if (signal?.aborted) {
			resolve(null);
			return;
		}

		const check = () => {
			const el = document.getElementById(id);
			return el && isHashTargetReady(el) ? el : null;
		};

		const existing = check();
		if (existing) {
			resolve(existing);
			return;
		}

		const finish = (result: HTMLElement | null) => {
			clearInterval(interval);
			clearTimeout(timer);
			resolve(result);
		};

		const interval = setInterval(() => {
			if (signal?.aborted) {
				finish(null);
				return;
			}

			const el = check();
			if (el) {
				finish(el);
			}
		}, checkEvery);

		const timer = setTimeout(() => finish(check()), timeout);

		signal?.addEventListener("abort", () => finish(null), { once: true });
	});
}

const NAV_SCROLL_OFFSET = 88;

/** Resolves once `scrollY` has not changed for `idleFor` ms. */
function waitForScrollIdle(
	idleFor = 150,
	timeout = 3000,
	signal?: AbortSignal,
): Promise<void> {
	return new Promise((resolve) => {
		let last = window.scrollY;
		let idle = 0;
		const step = 50;

		const finish = () => {
			clearInterval(interval);
			clearTimeout(timer);
			resolve();
		};

		const interval = setInterval(() => {
			if (signal?.aborted) return finish();
			if (window.scrollY === last) {
				idle += step;
				if (idle >= idleFor) finish();
			} else {
				idle = 0;
				last = window.scrollY;
			}
		}, step);
		const timer = setTimeout(finish, timeout);
		signal?.addEventListener("abort", finish, { once: true });
	});
}

/**
 * Scrolls to a hash target, accounting for the fixed navbar.
 */
export function scrollToHashTarget(
	el: HTMLElement,
	behavior: ScrollBehavior = "smooth",
) {
	const top =
		el.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET;

	window.scrollTo({
		top: Math.max(0, top),
		behavior,
	});
}

/**
 * Waits for layout to settle, then scrolls and corrects if the target drifts.
 */
export async function scrollToHashTargetWhenReady(
	id: string,
	signal?: AbortSignal,
) {
	const existing = document.getElementById(id);
	// Sections still loading above the target would grow mid-scroll, so the
	// target only counts as ready once every deferred section has content.
	const readyNow =
		!!existing &&
		isHashTargetReady(existing) &&
		[
			...document.querySelectorAll<HTMLElement>("[data-deferred-section]"),
		].every((section) => section.childElementCount > 0);

	const el = await waitForHashTarget(id, 50, 8000, signal);
	if (!el || signal?.aborted) return;

	// Target already on the page: scroll straight away. Waiting would let the
	// browser's native hash scroll start first, and restarting it mid-flight
	// reads as a stutter.
	if (!readyNow) {
		await waitForStableLayout(300, 50, 8000, signal);
		if (signal?.aborted) return;
	}

	scrollToHashTarget(el);

	// Only check for drift once the smooth scroll has finished; checking
	// mid-flight would restart it halfway there.
	await waitForScrollIdle(150, 3000, signal);
	await waitForStableLayout(200, 50, 3000, signal);
	if (signal?.aborted) return;

	const offset = el.getBoundingClientRect().top;
	if (Math.abs(offset - NAV_SCROLL_OFFSET) > 48) {
		scrollToHashTarget(el);
	}
}
