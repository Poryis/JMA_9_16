// useBeatPulse — drives beat-synced visual effects from the Web Audio
// clock exposed by `useRobotBoogieAudio.getAudioClock`.
//
// Instead of setState-ing on every RAF (which would rerender the entire
// Robot Boogie tree at 60 fps), the hook writes the current beat phase
// into a shared ref. Consumers register imperative subscribers via
// `subscribe(cb)` that get called every frame with
//   { beat, phase, beatFrac, pulse }
//   • beat      : integer beat index (0-based, monotonically increasing)
//   • phase     : 0..1 progress within the current beat
//   • beatFrac  : 0..1 progress within the current LOOP (whole-song bar)
//   • pulse     : 0..1 easing that spikes to 1 on the downbeat and falls
//
// Assumes 8 beats per loop (matches the current Robot Boogie stems).
// If the loop authoring changes, tune BEATS_PER_LOOP here — nothing
// downstream needs to know.

import { useEffect, useRef } from 'react';

const BEATS_PER_LOOP = 8;

export default function useBeatPulse(getAudioClock) {
  // Ref-based subscription registry. Zero rerenders per frame.
  const subsRef = useRef(new Set());
  const rafRef = useRef(0);
  const lastBeatRef = useRef(-1);

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const clock = getAudioClock ? getAudioClock() : null;
      if (clock) {
        const { audioTime, startTime, loopDuration } = clock;
        const elapsed = Math.max(0, audioTime - startTime);
        const beatDuration = loopDuration / BEATS_PER_LOOP;
        const beat = Math.floor(elapsed / beatDuration);
        const phase = (elapsed / beatDuration) - beat; // 0..1 within beat
        const beatFrac = (elapsed % loopDuration) / loopDuration; // 0..1 within loop
        // Downbeat spike: 1 at phase 0, easing out to 0 by phase ~0.35.
        const pulse = phase < 0.35 ? Math.pow(1 - phase / 0.35, 2) : 0;

        const payload = { beat, phase, beatFrac, pulse };
        subsRef.current.forEach((cb) => {
          try { cb(payload); } catch (_) { /* ignore consumer errors */ }
        });
        lastBeatRef.current = beat;
      } else {
        // Silent — send a "resting" payload so subscribers can revert.
        const payload = { beat: -1, phase: 0, beatFrac: 0, pulse: 0 };
        subsRef.current.forEach((cb) => {
          try { cb(payload); } catch (_) { /* ignore */ }
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [getAudioClock]);

  return {
    subscribe: (cb) => {
      subsRef.current.add(cb);
      return () => subsRef.current.delete(cb);
    },
  };
}
