// Lightweight piano-audio hook for Charlie's Song Studio.
// Preloads piano MP3s into Web Audio buffers so tapping a key has zero latency
// and supports polyphonic playback.

import { useCallback, useEffect, useRef } from 'react';
import { PIANO_KEYS } from '../data/songStudio';

export default function usePianoAudio() {
  const ctxRef = useRef(null);
  const buffersRef = useRef({});
  const masterGainRef = useRef(null);

  const initContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new Ctx();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = 1;
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // Preload all 15 piano MP3s as Audio buffers
  const preload = useCallback(async () => {
    const ctx = initContext();
    await Promise.all(PIANO_KEYS.map(async (k) => {
      if (buffersRef.current[k.id]) return;
      try {
        const r = await fetch(k.file);
        const buf = await r.arrayBuffer();
        buffersRef.current[k.id] = await ctx.decodeAudioData(buf);
      } catch {
        // Silently ignore — falls back to native Audio() if user taps before load
      }
    }));
  }, [initContext]);

  useEffect(() => {
    // Note: we don't auto-preload; the page kicks this off after the first user
    // interaction so AudioContext is allowed to start.
    return () => {
      try { ctxRef.current?.close(); } catch { /* ignore */ }
    };
  }, []);

  // Play a piano key by id (e.g. 'C4'). Polyphonic — each call spawns a fresh source.
  const playPianoNote = useCallback((id, gain = 0.7) => {
    const ctx = initContext();
    const buf = buffersRef.current[id];
    if (!buf) {
      // Fallback: native HTMLAudio element while buffers are still loading
      const key = PIANO_KEYS.find((k) => k.id === id);
      if (!key) return;
      try {
        const a = new Audio(key.file);
        a.volume = gain;
        a.play().catch(() => { /* ignore */ });
      } catch { /* ignore */ }
      return;
    }
    const source = ctx.createBufferSource();
    const g = ctx.createGain();
    source.buffer = buf;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    source.connect(g).connect(masterGainRef.current);
    source.start(0);
  }, [initContext]);

  return { preload, playPianoNote, initContext };
}
