import { clearSelected } from './state';
import { initBoxSelection } from './selection';
import { renderLetters, bindLetters } from './letters';
import { refs } from './refs';

function onApply() {
  const val = refs.input.value.trim();

  if (!val) return;

  clearSelected();
  renderLetters(val);
  bindLetters();
}

initBoxSelection(refs.stage);

refs.btn.addEventListener('click', onApply);
