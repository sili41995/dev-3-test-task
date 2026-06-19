import { letters, selected, clearSelected } from './state';
import { refs } from './refs';
import type { Position, Rect } from './types';

function rectsOverlap(rectA: Rect, rectB: Rect) {
  return (
    rectA.x < rectB.x + rectB.w &&
    rectA.x + rectA.w > rectB.x &&
    rectA.y < rectB.y + rectB.h &&
    rectA.y + rectA.h > rectB.y
  );
}

function updateSelectionRectDOM({ x, y, w, h }: Rect) {
  refs.selectionRect.style.left = x + 'px';
  refs.selectionRect.style.top = y + 'px';
  refs.selectionRect.style.width = w + 'px';
  refs.selectionRect.style.height = h + 'px';
}

function selectLettersInRect(selectionRect: Rect) {
  letters.forEach((el) => {
    const r = el.getBoundingClientRect();
    const letterRect: Rect = { x: r.left, y: r.top, w: r.width, h: r.height };

    if (rectsOverlap(selectionRect, letterRect)) {
      selected.add(el);
      el.classList.add('selected');
    }
  });
}

let isBoxSelecting = false;
let boxStart: Position = { x: 0, y: 0 };

function onBoxMove(e: MouseEvent) {
  if (!isBoxSelecting) return;

  const rect: Rect = {
    x: Math.min(e.clientX, boxStart.x),
    y: Math.min(e.clientY, boxStart.y),
    w: Math.abs(e.clientX - boxStart.x),
    h: Math.abs(e.clientY - boxStart.y),
  };

  updateSelectionRectDOM(rect);
  clearSelected();
  selectLettersInRect(rect);
}

function onBoxUp() {
  isBoxSelecting = false;
  refs.selectionRect.style.display = 'none';

  document.removeEventListener('mousemove', onBoxMove);
  document.removeEventListener('mouseup', onBoxUp);
}

function onStageMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('js-letter')) return;

  if (e.ctrlKey) return;

  isBoxSelecting = true;
  boxStart = { x: e.clientX, y: e.clientY };

  refs.selectionRect.style.cssText = `display:block; left:${e.clientX}px; top:${e.clientY}px; width:0; height:0;`;

  clearSelected();

  document.addEventListener('mousemove', onBoxMove);
  document.addEventListener('mouseup', onBoxUp);
}

function onDocMouseDown(e: MouseEvent) {
  const t = e.target as HTMLElement;
  const isLetter = t.classList.contains('js-letter');
  const isStage = t.classList.contains('js-stage');

  if (!isLetter && !e.ctrlKey && !isStage) {
    clearSelected();
  }
}

export function initBoxSelection(stage: HTMLElement) {
  stage.addEventListener('mousedown', onStageMouseDown);
  document.addEventListener('mousedown', onDocMouseDown);
}
