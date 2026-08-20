// usePinchPan — two-finger pinch-zoom + pan gesture handler for a
// touch/trackpad-friendly workspace container.
//
// Attaches native pointerdown/move/up/cancel listeners to the passed
// container ref. Tracks active pointers by ID. When 2 pointers are
// down simultaneously:
//   - Distance between them → scale multiplier
//   - Midpoint drift → translate
// When back to <2 pointers, gesture ends and the transform sticks.
//
// Single-pointer gestures fall through untouched so child character
// drag handlers keep working as-is. When a SECOND pointer arrives
// while a character is mid-drag, we dispatch a synthetic
// 'rb-pinch-start' event that character slots listen for and abort
// their pending drag state — otherwise the character would keep
// moving with the first finger while the pinch is scaling the
// workspace, which feels chaotic.
//
// Bounds: scale clamped to [0.6, 2.5] so kids can't zoom out into
// empty space or infinitely-in. Translate is not clamped — kids can
// pan freely; the workspace container's overflow is the only limit.

import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.5;

export const PINCH_START_EVENT = 'rb-pinch-start';

export default function usePinchPan(containerRef) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const pointersRef = useRef(new Map());       // pointerId → { x, y }
  const gestureRef = useRef(null);              // { startDist, startCenter, startTransform }
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });

  // Keep a ref mirror of transform so pointer handlers (which close
  // over the initial state) can read the latest without re-registering.
  useEffect(() => { transformRef.current = transform; }, [transform]);

  const reset = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const startGesture = () => {
      const pts = Array.from(pointersRef.current.values());
      if (pts.length < 2) return;
      const [p1, p2] = pts;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      gestureRef.current = {
        startDist: Math.max(1, Math.hypot(dx, dy)),
        startCenter: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
        startTransform: { ...transformRef.current },
      };
      // Signal any child character mid-drag to abort — otherwise the
      // char would keep moving alongside the pinch, feels chaotic.
      try { window.dispatchEvent(new CustomEvent(PINCH_START_EVENT)); }
      catch { /* ignore in non-browser envs */ }
    };

    const onDown = (e) => {
      // Only track touches / pens. Mouse can't do multi-pointer anyway.
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointersRef.current.size === 2 && !gestureRef.current) {
        startGesture();
      }
    };
    const onMove = (e) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const g = gestureRef.current;
      if (pointersRef.current.size < 2 || !g) return;
      const pts = Array.from(pointersRef.current.values()).slice(0, 2);
      const [p1, p2] = pts;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;

      const rawScale = g.startTransform.scale * (dist / g.startDist);
      const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, rawScale));
      const tx = g.startTransform.x + (cx - g.startCenter.x);
      const ty = g.startTransform.y + (cy - g.startCenter.y);
      setTransform({ x: tx, y: ty, scale });
      // Prevent browser page zoom / scroll while we own the gesture.
      if (e.cancelable) e.preventDefault();
    };
    const onUpOrCancel = (e) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) gestureRef.current = null;
    };

    // { passive: false } required so we can preventDefault on move.
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove, { passive: false });
    el.addEventListener('pointerup', onUpOrCancel);
    el.addEventListener('pointercancel', onUpOrCancel);
    el.addEventListener('pointerleave', onUpOrCancel);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUpOrCancel);
      el.removeEventListener('pointercancel', onUpOrCancel);
      el.removeEventListener('pointerleave', onUpOrCancel);
    };
  }, [containerRef]);

  return { transform, reset };
}
