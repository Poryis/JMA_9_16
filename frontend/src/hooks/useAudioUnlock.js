// useAudioUnlock — manages a one-time-per-session "audio unlock" gate.
//
// iOS Safari (and Chrome/Firefox to a lesser degree) require a user gesture
// before any AudioContext can play sound. Our pages each create their own
// context lazily on the first interaction, but a kid landing on a page may
// tap a bell as their FIRST gesture and hear silence because:
//   1. The AudioContext is created (suspended state)
//   2. playBellNote is called immediately
//   3. The .resume() promise hasn't completed yet
//   4. The audio buffer never plays
//
// This hook + the AudioUnlockOverlay solve it by intercepting the very first
// gesture at the document level, creating a throwaway AudioContext, resuming
// it, and playing a silent buffer. After that any subsequent AudioContext
// created by useAudio.js starts in 'running' state on the same tab.
//
// Persistence: sessionStorage (not localStorage). Each new tab/session shows
// the overlay once because iOS audio context state doesn't survive a tab close.

import { useCallback, useEffect, useState } from 'react';

const SESSION_KEY = 'jma_audio_unlocked_v1';

function alreadyUnlocked() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
}

function markUnlocked() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
}

// Performs the iOS audio-unlock dance: create a context, resume it, play a
// silent buffer to fully wake the audio subsystem. We close the context
// afterward because each tab is capped (~6 in Chrome) at simultaneous
// AudioContext instances.
async function performUnlock() {
  let ctx = null;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;
    ctx = new Ctor();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Play a 1-sample silent buffer — this is the canonical iOS-unlock trick.
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    if (source.start) source.start(0);
    else if (source.noteOn) source.noteOn(0);
    return true;
  } catch (_) {
    return false;
  } finally {
    // Schedule a close shortly after the silent buffer has played out.
    if (ctx) {
      setTimeout(() => { try { ctx.close(); } catch (_) { /* ignore */ } }, 200);
    }
  }
}

export default function useAudioUnlock() {
  const [needsUnlock, setNeedsUnlock] = useState(() => !alreadyUnlocked());

  const unlock = useCallback(async () => {
    await performUnlock();
    markUnlocked();
    setNeedsUnlock(false);
  }, []);

  // Also auto-dismiss if ANY page-wide gesture happens — e.g. the kid taps a
  // bell directly without going through the overlay. Their first gesture will
  // unlock audio at the system level anyway; we just need to hide our UI.
  useEffect(() => {
    if (!needsUnlock) return;
    const handler = () => {
      markUnlocked();
      setNeedsUnlock(false);
    };
    document.addEventListener('pointerdown', handler, { once: true, capture: true });
    return () => document.removeEventListener('pointerdown', handler, { capture: true });
  }, [needsUnlock]);

  return { needsUnlock, unlock };
}
