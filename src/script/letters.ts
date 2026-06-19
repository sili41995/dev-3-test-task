import type { LetterEl } from './types';
import { setLetters } from './state';
import { onLetterMouseDown } from './drag';
import { refs } from './refs';

export function renderLetters(val: string) {
  refs.stage.innerHTML = [...val].map((ch, i) =>
    `<span class="letter js-letter" data-index="${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');
}

function setupLetter(el: LetterEl, i: number) {
  el._origIndex = i;
  el.addEventListener('mousedown', onLetterMouseDown);
}

export function bindLetters() {
  const els = Array.from(refs.stage.querySelectorAll<LetterEl>('.js-letter'));

  els.forEach(setupLetter);
  setLetters(els);
}
