import type { LetterEl, Offset } from './types';
import { letters, selected, clearSelected } from './state';

let dragTargets: LetterEl[] = [];
let dragOffsets: { dx: number; dy: number }[] = [];
let swapTarget: LetterEl | null = null;
let isSingleDrag = false;
let singleSwapOrigin: Offset | null = null;

function getCenter(el: HTMLElement) {
  const r = el.getBoundingClientRect();

  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function fixPosition(el: HTMLElement) {
  if (el.style.position === 'fixed') return;

  const r = el.getBoundingClientRect();

  el.style.position = 'fixed';
  el.style.left = r.left + 'px';
  el.style.top = r.top + 'px';
  el.style.width = r.width + 'px';
  el.style.height = r.height + 'px';
  el.style.margin = '0';
}

function startSingleDrag(e: MouseEvent, el: LetterEl) {
  isSingleDrag = true;
  dragTargets = [el];
  swapTarget = null;

  fixPosition(el);

  singleSwapOrigin = { left: parseFloat(el.style.left), top: parseFloat(el.style.top) };
  el.style.zIndex = '1000';

  dragOffsets = [{ dx: e.clientX - parseFloat(el.style.left), dy: e.clientY - parseFloat(el.style.top) }];
  el.classList.add('dragging');

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragUp);
}

function startGroupDrag(e: MouseEvent, targets: LetterEl[]) {
  isSingleDrag = false;
  dragTargets = targets;
  dragOffsets = [];

  const rects = targets.map((el) => el.getBoundingClientRect());

  rects.forEach((r) => {
    dragOffsets.push({
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
    });
  });

  targets.forEach((el, index) => {
    if (el.style.position !== 'fixed') {
      const r = rects[index];
      el.style.position = 'fixed';
      el.style.left = r.left + 'px';
      el.style.top = r.top + 'px';
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
      el.style.margin = '0';
    }
    el.style.zIndex = '1000';
    el.classList.add('dragging');
  });

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragUp);
}

function findSwapTarget(moving: LetterEl): LetterEl | null {
  const mc = getCenter(moving);

  for (const other of letters) {
    if (other === moving) continue;

    const or = other.getBoundingClientRect();

    if (mc.x >= or.left && mc.x <= or.right && mc.y >= or.top && mc.y <= or.bottom) {
      return other;
    }
  }

  return null;
}

function onDragMove(e: MouseEvent) {
  dragTargets.forEach((el, i) => {
    el.style.left = e.clientX - dragOffsets[i].dx + 'px';
    el.style.top = e.clientY - dragOffsets[i].dy + 'px';
  });

  if (isSingleDrag && dragTargets.length === 1) {
    const moving = dragTargets[0];
    const found = findSwapTarget(moving);

    if (found !== swapTarget) {
      if (swapTarget) swapTarget.classList.remove('swap-hover');
      swapTarget = found;
      if (swapTarget) swapTarget.classList.add('swap-hover');
    }
  }
}

function resetSwap(target: LetterEl, origin: Offset) {
  target.classList.remove('swap-hover');

  fixPosition(target);

  target.style.left = origin.left + 'px';
  target.style.top = origin.top + 'px';
  target.style.zIndex = '999';
}

function clearDragState() {
  swapTarget = null;
  singleSwapOrigin = null;
  isSingleDrag = false;
  dragTargets = [];
  dragOffsets = [];
}

function onDragUp() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragUp);

  if (isSingleDrag && dragTargets.length === 1) {
    const moving = dragTargets[0];

    if (swapTarget && singleSwapOrigin) {
      resetSwap(swapTarget, singleSwapOrigin);
    }

    moving.classList.remove('dragging');
  } else {
    dragTargets.forEach((el) => el.classList.remove('dragging'));
  }

  clearDragState();
}

function toggleSelection(el: LetterEl) {
  if (selected.has(el)) {
    selected.delete(el);
    el.classList.remove('selected');
  } else {
    selected.add(el);
    el.classList.add('selected');
  }
}

export function onLetterMouseDown(e: MouseEvent) {
  const el = e.currentTarget as LetterEl;

  e.preventDefault();
  e.stopPropagation();

  if (e.ctrlKey) {
    toggleSelection(el);

    return;
  }

  if (selected.has(el) && selected.size > 1) {
    startGroupDrag(e, [...selected]);
  } else {
    if (!selected.has(el)) {
      clearSelected();
    }

    startSingleDrag(e, el);
  }
}
