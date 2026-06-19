import type { LetterEl } from './types';

export let letters: LetterEl[] = [];
export let selected: Set<LetterEl> = new Set();

export function setLetters(els: LetterEl[]) {
  letters = els;
}

export function clearSelected() {
  selected.forEach(s => s.classList.remove('selected'));
  selected.clear();
}
