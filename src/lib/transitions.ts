import type { TransitionAnimationPair, TransitionDirectionalAnimations } from 'astro';

// A mechanical, stepped snap instead of a smooth crossfade — matches the
// dot-matrix / typewriter feel of the rest of the UI. Keyframes are defined
// as global CSS in `src/layouts/Layout.astro` (`term-cut-out` / `term-cut-in`).
const cutPair: TransitionAnimationPair = {
	old: {
		name: 'term-cut-out',
		duration: '180ms',
		easing: 'steps(4, jump-none)',
		fillMode: 'forwards',
	},
	new: {
		name: 'term-cut-in',
		duration: '180ms',
		delay: '70ms',
		easing: 'steps(4, jump-none)',
		fillMode: 'backwards',
	},
};

export const terminalCut: TransitionDirectionalAnimations = {
	forwards: cutPair,
	backwards: cutPair,
};
