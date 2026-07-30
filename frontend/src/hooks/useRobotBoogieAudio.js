// useRobotBoogieAudio — Web Audio API version.
//
// The v1 attempt used HTMLAudioElement with `loop=true`, but MP3 loops on
// HTMLAudioElement are NOT sample-accurate — each loop can gap by tens of
// milliseconds, and after a few laps the 12 stems drift wildly out of sync.
// The user reported "the loops arent at all together" and that was the
// core problem.
//
// This version:
//   1. Fetches + decodes each stem into an in-memory AudioBuffer (once).
//   2. On the FIRST character tap, spins up 12 AudioBufferSourceNodes and
//      calls .start(startTime) on ALL of them at the exact same audio-clock
//      timestamp — sample-accurate group start.
//   3. Each source is routed through its own GainNode. Toggling a character
//      just ramps that GainNode to 1.0 (audible) or 0.0 (silent) over ~15
//      ms. The source never stops, so it stays in perfect sync with the
//      other 11 for the entire session.
//
// Result: every stem lines up on the measure grid indefinitely.

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const ctxRef = useRef(null);
  const buffersRef = useRef({});   // stemId -> AudioBuffer
  const sourcesRef = useRef({});   // stemId -> AudioBufferSourceNode
  const gainsRef = useRef({});     // stemId -> GainNode
  const startedRef = useRef(false);
  // Exposed via getAudioClock() so downstream visual effects (lightning,
  // beat pulses) can lock to the exact same audio-clock timeline the
  // stems are looping on. Populated on first playback.
  const startTimeRef = useRef(null);
  const loopDurationRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [activeStems, setActiveStems] = useState(new Set());

  // ---- preload + decode all 12 stems as AudioBuffers ----
  useEffect(() => {
    let cancelled = false;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      setLoaded(true);
      return;
    }
    const ctx = new Ctor();
    ctxRef.current = ctx;

    Promise.all(
      STEM_IDS.map(async (stem) => {
        try {
          const res = await fetch(`assets/audio/robot-boogie/${stem}.mp3`);
          const arrayBuf = await res.arrayBuffer();
          // Wrap in a Promise because some old iOS Safari builds only
          // support the callback form of decodeAudioData.
          const audioBuf = await new Promise((resolve, reject) => {
            const p = ctx.decodeAudioData(arrayBuf, resolve, reject);
            if (p && typeof p.then === 'function') p.then(resolve, reject);
          });
          buffersRef.current[stem] = audioBuf;
        } catch (_) {
          /* individual stem failure — page still functions with others */
        }
      })
    ).then(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => {
      cancelled = true;
      // Stop every source
      Object.values(sourcesRef.current).forEach((s) => {
        try { s.stop(); } catch (_) { /* already stopped */ }
      });
      try { ctx.close(); } catch (_) { /* ignore */ }
      ctxRef.current = null;
      buffersRef.current = {};
      sourcesRef.current = {};
      gainsRef.current = {};
      startedRef.current = false;
    };
  }, []);

  // ---- toggle a stem's audibility ----
  const setStemActive = useCallback(async (stemId, active) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (_) { /* ignore */ }
    }

    // First-touch: spin up all 12 sources + gains and start them at the
    // SAME AudioContext timestamp. This is the anti-drift move.
    if (!startedRef.current) {
      startedRef.current = true;
      const startTime = ctx.currentTime + 0.05; // small lookahead
      startTimeRef.current = startTime;
      STEM_IDS.forEach((id) => {
        const buf = buffersRef.current[id];
        if (!buf) return;
        // Capture the loop duration off the first available buffer —
        // every stem was authored at the same length, so any works.
        if (loopDurationRef.current === null) {
          loopDurationRef.current = buf.duration;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0; // start silent
        src.connect(gain).connect(ctx.destination);
        src.start(startTime);
        sourcesRef.current[id] = src;
        gainsRef.current[id] = gain;
      });
    }

    // Ramp the requested gain — 15 ms is enough to avoid audible clicks
    // without introducing a perceptible fade delay.
    const gain = gainsRef.current[stemId];
    if (gain) {
      const now = ctx.currentTime;
      // Cancel any in-flight ramp on this node so we don't fight it
      try { gain.gain.cancelScheduledValues(now); } catch (_) { /* ignore */ }
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(active ? 1.0 : 0.0, now + 0.015);
    }

    setActiveStems((prev) => {
      const next = new Set(prev);
      if (active) next.add(stemId);
      else next.delete(stemId);
      return next;
    });
  }, []);

  // ---- mute everyone (reset button) ----
  const muteAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    Object.values(gainsRef.current).forEach((g) => {
      try { g.gain.cancelScheduledValues(now); } catch (_) { /* ignore */ }
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + 0.04);
    });
    setActiveStems(new Set());
  }, []);

  // ---- audio-clock accessor for beat-synced visuals ----
  //
  // Returns null until the first tap has kicked off the group start.
  // After that, callers can use `elapsed = ctx.currentTime - startTime`
  // together with `loopDuration` (seconds per loop) to derive an exact
  // beat phase locked to the audio timeline.
  const getAudioClock = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || startTimeRef.current === null || loopDurationRef.current === null) {
      return null;
    }
    return {
      audioTime: ctx.currentTime,
      startTime: startTimeRef.current,
      loopDuration: loopDurationRef.current,
    };
  }, []);

  return { loaded, activeStems, setStemActive, muteAll, getAudioClock };
}
