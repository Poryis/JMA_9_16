// useRobotBoogieAudio — audio manager for the Robot Boogie mixer game.
//
// Design goal: perfect sync between the 12 stems. If we spun up an
// <audio> element on demand (only after a kid taps a character) each
// stem would restart from t=0 and drift out of the shared measure grid,
// producing a "glitchy restart" that the user explicitly asked us to
// avoid.
//
// So instead: preload all 12 stems, and on the very FIRST character tap
// (which counts as an in-page user gesture — required by iOS autoplay
// policy) start EVERY stem simultaneously. From that point on they all
// loop in lockstep. Toggling a character just toggles `muted` on the
// matching HTMLAudioElement — audible/inaudible without ever restarting.

import { useCallback, useEffect, useRef, useState } from 'react';

// Stem IDs — file basenames under /public/assets/audio/robot-boogie/.
// Kept as an ordered list so we can iterate deterministically.
export const STEM_IDS = [
  'robot-bass',
  'robot-drum-1',
  'robot-drum-1-1',
  'robot-drum-2',
  'robot-drum-3',
  'robot-gtr',
  'robot-horns-1',
  'robot-horns-2',
  'robot-horns-3',
  'robot-synth-1',
  'robot-synth-2',
  'robot-synth-3',
];

export default function useRobotBoogieAudio() {
  const audioMap = useRef({}); // { stemId: HTMLAudioElement }
  const startedRef = useRef(false);
  const [ready, setReady] = useState(false);
  // Which stems are currently unmuted (for UI feedback if needed)
  const [activeStems, setActiveStems] = useState(new Set());

  // ---- preload all 12 audio elements exactly once ----
  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;

    STEM_IDS.forEach((stem) => {
      const audio = new Audio(`assets/audio/robot-boogie/${stem}.mp3`);
      audio.loop = true;
      audio.muted = true;         // start silent — flip mute on activation
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      // iOS requires playsinline; on <audio> this attribute maps directly.
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');

      const onReady = () => {
        loadedCount += 1;
        if (!cancelled && loadedCount === STEM_IDS.length) setReady(true);
      };
      audio.addEventListener('canplaythrough', onReady, { once: true });

      audioMap.current[stem] = audio;
    });

    return () => {
      cancelled = true;
      Object.values(audioMap.current).forEach((a) => {
        try { a.pause(); a.src = ''; a.load(); } catch (_) { /* ignore */ }
      });
      audioMap.current = {};
      startedRef.current = false;
    };
  }, []);

  // ---- toggle a stem ----
  // First call in a session ALSO fires the group-start dance so every
  // stem begins from t=0 together. Subsequent calls just mute/unmute.
  const setStemActive = useCallback(async (stemId, active) => {
    // First-touch group-start
    if (!startedRef.current) {
      startedRef.current = true;
      // Rewind every stem to 0 then play them all in the same tick.
      // We await the .play() promises so iOS can grant the entire cluster
      // permission from the single user gesture that triggered this call.
      const promises = STEM_IDS.map((id) => {
        const a = audioMap.current[id];
        if (!a) return Promise.resolve();
        a.muted = true;
        try { a.currentTime = 0; } catch (_) { /* iOS may throw pre-load */ }
        const p = a.play();
        return p && typeof p.catch === 'function'
          ? p.catch(() => { /* autoplay policy edge — silent fail */ })
          : Promise.resolve();
      });
      await Promise.all(promises);
    }

    const a = audioMap.current[stemId];
    if (a) a.muted = !active;

    setActiveStems((prev) => {
      const next = new Set(prev);
      if (active) next.add(stemId);
      else next.delete(stemId);
      return next;
    });
  }, []);

  // ---- silence everyone (used by the RESET button) ----
  const muteAll = useCallback(() => {
    Object.values(audioMap.current).forEach((a) => { a.muted = true; });
    setActiveStems(new Set());
  }, []);

  return { ready, activeStems, setStemActive, muteAll };
}
