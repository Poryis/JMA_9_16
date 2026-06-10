// StewDrummer — Stew the llama performs the drums for Boom Garden.
//
// Each hit alternates between his LEFT-stick and RIGHT-stick animations
// (4 frames each, frame 1 = the shared neutral pose). The same animation
// flow runs whether the kid taps Stew himself (input phase) or whether
// `.flash()` is called from the demo (Doc's claps in Copy Cat / metronome
// in Tap Trail). Direct-DOM `src` swaps — zero React renders during the
// animation so we stay in time with the audio.

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';

const LEFT_FRAMES = [
  'assets/animations/stew-drum/left-1.png',  // neutral
  'assets/animations/stew-drum/left-2.png',
  'assets/animations/stew-drum/left-3.png',
  'assets/animations/stew-drum/left-4.png',
];
const RIGHT_FRAMES = [
  'assets/animations/stew-drum/right-1.png', // neutral (same pose as left-1)
  'assets/animations/stew-drum/right-2.png',
  'assets/animations/stew-drum/right-3.png',
  'assets/animations/stew-drum/right-4.png',
];

// Per-frame hold (ms). 4 frames × 45ms ≈ 180ms total stick travel; feels snappy
// at 80 BPM (750 ms/beat) without bleeding into the next downbeat.
const FRAME_MS = 45;

export const StewDrummer = forwardRef(function StewDrummer({ onTap, disabled, hint }, ref) {
  const imgRef = useRef(null);
  const timersRef = useRef([]);

  // Preload every frame so the first hit doesn't stutter waiting on disk.
  useEffect(() => {
    [...LEFT_FRAMES, ...RIGHT_FRAMES].forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, []);

  const clearAnimTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // Play one full hit. Alternation counter lives on the <img>'s data-hits
  // attribute — survives any React re-mount or strict-mode double-render, so
  // we genuinely flip sides on every successive hit no matter where the call
  // came from (kid tap, demo flash, etc).
  const playHit = () => {
    if (!imgRef.current) return;
    const count = parseInt(imgRef.current.dataset.hits || '0', 10);
    imgRef.current.dataset.hits = String(count + 1);
    const useLeft = count % 2 === 0;
    const frames = useLeft ? LEFT_FRAMES : RIGHT_FRAMES;
    clearAnimTimers();
    imgRef.current.src = frames[1];
    timersRef.current.push(setTimeout(() => {
      if (imgRef.current) imgRef.current.src = frames[2];
    }, FRAME_MS));
    timersRef.current.push(setTimeout(() => {
      if (imgRef.current) imgRef.current.src = frames[3];
    }, FRAME_MS * 2));
    timersRef.current.push(setTimeout(() => {
      // Snap back to whichever neutral pose matches the side we just hit so
      // the bounce-back looks smooth rather than teleporting across sides.
      if (imgRef.current) imgRef.current.src = frames[0];
    }, FRAME_MS * 4));
  };

  useImperativeHandle(ref, () => ({ flash: playHit }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    playHit();
    onTap?.();
  };

  // Cleanup on unmount.
  useEffect(() => () => clearAnimTimers(), []);

  return (
    <motion.button
      type="button"
      data-testid="boom-stew-drummer"
      onPointerDown={handleDown}
      disabled={disabled}
      aria-label="Tap Stew to play the drum"
      className="relative bg-transparent border-0 p-0 select-none"
      style={{
        width: 'clamp(220px, 42vw, 360px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        touchAction: 'none',
        filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.35))',
      }}
      whileTap={!disabled ? { y: 4 } : undefined}
    >
      <img
        ref={imgRef}
        src={LEFT_FRAMES[0]}  // shared neutral pose for both sides
        alt="Stew on drums"
        draggable={false}
        className="w-full h-auto object-contain pointer-events-none select-none"
      />
      {hint && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-3 px-3 py-0.5 text-xs font-black font-display whitespace-nowrap"
          style={{
            borderColor: 'var(--jma-dark)',
            backgroundColor: 'white',
            color: 'var(--jma-dark)',
            boxShadow: '0 3px 0 0 var(--jma-dark)',
          }}
        >
          {hint}
        </div>
      )}
    </motion.button>
  );
});

export default StewDrummer;
