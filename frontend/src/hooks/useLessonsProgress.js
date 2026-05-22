// Tracks which lessons have been fully watched (persisted in localStorage).
// Lesson N is "unlocked" when lesson N-1 is in the watched set (lesson 1 is always unlocked).

import { useCallback, useEffect, useState } from 'react';

const KEY = 'jma_lessons_watched_v1';

function loadWatched() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(Number) : [];
  } catch {
    return [];
  }
}

function saveWatched(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

export function useLessonsProgress() {
  const [watched, setWatched] = useState(loadWatched);

  // Sync across tabs / on storage events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setWatched(loadWatched());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markWatched = useCallback((num) => {
    setWatched((prev) => {
      if (prev.includes(num)) return prev;
      const next = [...prev, num].sort((a, b) => a - b);
      saveWatched(next);
      return next;
    });
  }, []);

  const isWatched = useCallback((num) => watched.includes(num), [watched]);

  // Lesson 1 always unlocked. Lesson N unlocked when N-1 is watched.
  const isUnlocked = useCallback(
    (num) => num === 1 || watched.includes(num - 1),
    [watched]
  );

  const reset = useCallback(() => {
    saveWatched([]);
    setWatched([]);
  }, []);

  return { watched, markWatched, isWatched, isUnlocked, reset };
}
