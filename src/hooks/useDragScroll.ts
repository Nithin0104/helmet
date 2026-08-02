import { useEffect, useRef } from 'react';

/**
 * Pointer drag-to-scroll for a horizontal track (product rails). Returns a ref
 * to attach to the scroll container. Ports the DC `setupDrag` behavior, including
 * suppressing the click that would otherwise fire on a card after a drag, so a
 * drag never accidentally opens a product. Set `cursor: grab` on the element in
 * CSS; the hook flips it to `grabbing` while dragging.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let pointerId = -1;

    const onPointerDown = (e: PointerEvent) => {
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      pointerId = e.pointerId;
      // Keep receiving move/up events even if the pointer leaves the element
      // mid-drag, so a fast drag tracks smoothly through the release.
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };

    const end = () => {
      down = false;
      if (pointerId !== -1) {
        el.releasePointerCapture?.(pointerId);
        pointerId = -1;
      }
      el.style.cursor = '';
    };

    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', end);
      el.removeEventListener('pointercancel', end);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return ref;
}
