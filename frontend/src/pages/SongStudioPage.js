// Charlie's Song Studio — guided melody composition.
// Kids pick a mood, tap piano keys to fill a 16-slot grid (auto-advancing
// cursor), then press Play to hear their song over a mood-matched drum loop.

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Save, ArrowLeft, BookOpen, Music, Drum, Piano } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import Confetti from '../components/Confetti';
import usePianoAudio from '../hooks/usePianoAudio';
import { PIANO_KEYS, MOODS, TOTAL_SLOTS, SLOTS_PER_ROW } from '../data/songStudio';
import { earnSticker } from '../hooks/useStickers';

const SONGS_KEY = 'jma_songs_v1';
const loadSongs = () => { try { return JSON.parse(localStorage.getItem(SONGS_KEY) || '[]'); } catch { return []; } };
const saveSongs = (s) => { try { localStorage.setItem(SONGS_KEY, JSON.stringify(s)); } catch { /* ignore */ } };

// Adjective + noun namer for default song names.
const ADJ = ['Sunny', 'Sparkly', 'Bouncy', 'Dreamy', 'Wiggly', 'Happy', 'Cool', 'Silly', 'Magic', 'Wild', 'Sweet', 'Cosmic'];
const NOUN = ['Song', 'Tune', 'Jam', 'Melody', 'Groove', 'Anthem', 'Riff', 'Beat'];
const randomName = () => `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]}`;

function ColoredKey({ keyDef, scaleHighlighted, isTonic, onTap, playingNow }) {
  const dim = !scaleHighlighted;
  return (
    <motion.button
      data-testid={`piano-key-${keyDef.id}`}
      onClick={() => onTap(keyDef)}
      className="relative flex flex-col items-center justify-end rounded-b-xl border-3 select-none"
      style={{
        width: 'clamp(44px, 8vw, 64px)',
        height: 'clamp(120px, 22vw, 170px)',
        backgroundColor: dim ? 'rgba(255,255,255,0.55)' : keyDef.color,
        borderColor: 'var(--jma-dark)',
        boxShadow: '0 4px 0 0 var(--jma-dark)',
        opacity: dim ? 0.55 : 1,
        filter: playingNow ? 'brightness(1.35)' : 'none',
        transform: playingNow ? 'translateY(3px)' : 'translateY(0)',
        transition: 'transform 0.1s, filter 0.1s',
      }}
      whileTap={{ y: 4, boxShadow: '0 1px 0 0 var(--jma-dark)' }}
    >
      {/* Tonic indicator (small "home" dot) */}
      {isTonic && (
        <div
          className="absolute top-1 right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--jma-dark)', border: '1.5px solid white' }}
          title="Home note"
        />
      )}
      {/* Octave indicator at the top */}
      <div className="absolute top-1.5 left-1.5 text-[9px] font-black opacity-50" style={{ color: 'var(--jma-dark)' }}>
        {keyDef.octave}
      </div>
      <span
        className="mb-2 text-xs md:text-sm font-black font-display leading-none"
        style={{ color: 'var(--jma-dark)', textShadow: '1px 1px 0 rgba(255,255,255,0.6)' }}
      >
        {keyDef.solfege}
      </span>
    </motion.button>
  );
}

export default function SongStudioPage() {
  const navigate = useNavigate();
  const { preload, playPianoNote, initContext } = usePianoAudio();

  const [view, setView] = useState('compose');       // compose | gallery
  const [moodId, setMoodId] = useState('happy');
  const [slots, setSlots] = useState(() => Array(TOTAL_SLOTS).fill(null));
  const [cursor, setCursor] = useState(0);            // next slot to auto-fill
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSlot, setPlayingSlot] = useState(-1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [songs, setSongs] = useState(loadSongs);
  // Accompaniment toggles — kids can solo their melody by switching these off
  const [drumsOn, setDrumsOn] = useState(true);
  const [chordsOn, setChordsOn] = useState(true);

  const drumAudioRef = useRef(null);
  const playTimeoutsRef = useRef([]);
  const cancelPlayRef = useRef(false);

  const mood = MOODS[moodId];

  // Preload piano buffers on first interaction
  const ensureLoaded = useCallback(() => {
    initContext();
    preload();
  }, [initContext, preload]);

  // Tap a piano key → play it + auto-advance the cursor
  const handleKeyTap = useCallback((keyDef) => {
    ensureLoaded();
    playPianoNote(keyDef.id);
    setSlots((prev) => {
      const next = [...prev];
      const idx = cursor < TOTAL_SLOTS ? cursor : prev.findIndex((s) => s == null);
      if (idx < 0) return prev; // grid is full
      next[idx] = keyDef.id;
      return next;
    });
    setCursor((c) => Math.min(c + 1, TOTAL_SLOTS));
  }, [ensureLoaded, playPianoNote, cursor]);

  // Tap a slot — clears it (and moves the cursor there)
  const handleSlotTap = useCallback((slotIdx) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setCursor(slotIdx);
  }, []);

  const clearAll = useCallback(() => {
    setSlots(Array(TOTAL_SLOTS).fill(null));
    setCursor(0);
  }, []);

  // Stop any running playback
  const stopPlayback = useCallback(() => {
    cancelPlayRef.current = true;
    playTimeoutsRef.current.forEach((t) => clearTimeout(t));
    playTimeoutsRef.current = [];
    if (drumAudioRef.current) {
      try { drumAudioRef.current.pause(); drumAudioRef.current.currentTime = 0; } catch { /* ignore */ }
      drumAudioRef.current = null;
    }
    setIsPlaying(false);
    setPlayingSlot(-1);
  }, []);

  useEffect(() => stopPlayback, [stopPlayback]);

  // Play the composed song. Plays the melody twice, with the mood's
  // chord progression on beat 1 of each measure (chord notes are quieter so
  // the kid's melody stays in front).
  const playSong = useCallback(() => {
    ensureLoaded();
    stopPlayback();
    cancelPlayRef.current = false;
    setIsPlaying(true);

    // Backing drum loop (if any) — loops underneath both play-throughs
    if (mood.drumLoop && drumsOn) {
      try {
        const a = new Audio(mood.drumLoop);
        a.volume = 0.45;
        a.loop = true;
        a.play().catch(() => { /* autoplay blocked */ });
        drumAudioRef.current = a;
      } catch { /* ignore */ }
    }

    const beatMs = 60_000 / mood.bpm;
    const REPEATS = 2;
    const totalBeats = TOTAL_SLOTS * REPEATS;

    for (let beat = 0; beat < totalBeats; beat++) {
      const slotIdx = beat % TOTAL_SLOTS;            // which slot in this play-through
      const measureIdx = Math.floor(slotIdx / SLOTS_PER_ROW); // 0..3
      const measureBeat = slotIdx % SLOTS_PER_ROW;   // 0..3
      const noteId = slots[slotIdx];

      const t = setTimeout(() => {
        if (cancelPlayRef.current) return;
        setPlayingSlot(slotIdx);
        // Play the chord triad on the first beat of every measure (if enabled)
        if (chordsOn && measureBeat === 0 && mood.chordProgression) {
          const chord = mood.chordProgression[measureIdx];
          if (chord) {
            chord.notes.forEach((n) => playPianoNote(n, 0.35));
          }
        }
        // Play the melody note (louder so it stays on top)
        if (noteId) playPianoNote(noteId, 0.85);
      }, beat * beatMs);
      playTimeoutsRef.current.push(t);
    }

    // End-of-song cleanup after both repeats finish
    const end = setTimeout(() => {
      if (cancelPlayRef.current) return;
      stopPlayback();
    }, totalBeats * beatMs + 200);
    playTimeoutsRef.current.push(end);
  }, [ensureLoaded, stopPlayback, mood, slots, playPianoNote, drumsOn, chordsOn]);

  // Save the current song to localStorage
  const handleSave = useCallback(() => {
    if (slots.every((s) => s == null)) return;
    setPendingName(randomName());
    setShowSaveModal(true);
  }, [slots]);

  const confirmSave = useCallback(() => {
    const name = pendingName.trim() || randomName();
    const newSong = {
      id: `song_${Date.now()}`,
      name,
      moodId,
      slots: [...slots],
      bpm: mood.bpm,
      createdAt: new Date().toISOString(),
    };
    const next = [newSong, ...songs];
    saveSongs(next);
    setSongs(next);
    setShowSaveModal(false);
    setShowCelebration(true);
    try { earnSticker('songwriter'); } catch { /* ignore */ }
    setTimeout(() => setShowCelebration(false), 2200);
  }, [pendingName, moodId, slots, mood.bpm, songs]);

  // Load a saved song
  const loadSong = useCallback((song) => {
    stopPlayback();
    setMoodId(song.moodId);
    setSlots(song.slots);
    setCursor(song.slots.findIndex((s) => s == null) >= 0 ? song.slots.findIndex((s) => s == null) : TOTAL_SLOTS);
    setView('compose');
  }, [stopPlayback]);

  const deleteSong = useCallback((id) => {
    const next = songs.filter((s) => s.id !== id);
    saveSongs(next);
    setSongs(next);
  }, [songs]);

  const filledCount = slots.filter((s) => s != null).length;
  const isFull = filledCount === TOTAL_SLOTS;

  return (
    <div
      data-testid="song-studio-page"
      className="min-h-screen flex flex-col relative"
      style={{
        background: `linear-gradient(180deg, ${mood.color}33 0%, white 60%)`,
      }}
    >
      <GameHeader title="Charlie's Song Studio" showHomeButton={true} />
      <FullscreenButton />

      <main className="flex-1 flex flex-col items-center pt-14 md:pt-20 pb-6 px-3 max-w-4xl mx-auto w-full">

        {/* MOOD PICKER */}
        <div className="w-full mb-3">
          <div className="text-center text-xs uppercase font-black opacity-60 mb-1" style={{ color: 'var(--jma-dark)' }}>
            Pick a mood
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(MOODS).map((m) => (
              <button
                key={m.id}
                data-testid={`mood-${m.id}`}
                onClick={() => { setMoodId(m.id); stopPlayback(); }}
                className="rounded-2xl border-3 p-2 text-center"
                style={{
                  borderColor: 'var(--jma-dark)',
                  backgroundColor: moodId === m.id ? m.color : 'white',
                  color: 'var(--jma-dark)',
                  boxShadow: moodId === m.id ? '0 5px 0 0 var(--jma-dark)' : '0 3px 0 0 var(--jma-dark)',
                  transform: moodId === m.id ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 0.12s, background-color 0.2s, box-shadow 0.12s',
                }}
              >
                <div className="text-2xl md:text-3xl">{m.emoji}</div>
                <div className="text-xs md:text-sm font-black font-display leading-tight">{m.name}</div>
                <div className="text-[10px] opacity-60 leading-tight mt-0.5">{m.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* COMPOSITION GRID + CHARLIE */}
        <div className="w-full flex items-center gap-3 mb-3">
          <motion.img
            src={mood.charlie}
            alt="Charlie"
            draggable={false}
            className="object-contain pointer-events-none select-none flex-shrink-0"
            style={{ width: 'clamp(60px, 11vw, 110px)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))' }}
            animate={isPlaying ? { y: [0, -8, 0], rotate: [-3, 3, -3] } : { y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: isPlaying ? 0.6 : 2.4, ease: 'easeInOut' }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase font-black opacity-60" style={{ color: 'var(--jma-dark)' }}>
                {filledCount} {filledCount === 1 ? 'note' : 'notes'} placed · {mood.bpm} BPM · plays 2×
              </div>
              <div className="flex items-center gap-1 text-[10px] opacity-70" style={{ color: 'var(--jma-dark)' }}>
                <span className="font-black uppercase">Chords:</span>
                <span className="font-black">
                  {mood.chordProgression.map((c) => c.label).join(' · ')}
                </span>
              </div>
            </div>
            <div
              className="text-[10px] md:text-xs text-center mb-1.5 font-bold rounded-md px-2 py-1"
              style={{
                color: 'var(--jma-dark)',
                backgroundColor: `${mood.color}33`,
                border: `1.5px dashed ${mood.accent}`,
              }}
              data-testid="song-studio-rests-tip"
            >
              💡 Tip: You don't have to fill every beat — leave some empty for rests!
            </div>
            <div
              className="rounded-2xl border-3 p-2"
              style={{
                borderColor: 'var(--jma-dark)',
                backgroundColor: 'rgba(255,255,255,0.85)',
                boxShadow: '0 4px 0 0 var(--jma-dark)',
              }}
            >
              {/* 4 measure rows, each with a chord label + 4 slots */}
              {[0, 1, 2, 3].map((measureIdx) => {
                const chord = mood.chordProgression[measureIdx];
                return (
                  <div key={measureIdx} className="flex items-center gap-1.5 md:gap-2 mb-1 last:mb-0">
                    <div
                      className="flex-shrink-0 w-9 md:w-12 rounded-md text-center py-1 border-2"
                      style={{
                        borderColor: 'var(--jma-dark)',
                        backgroundColor: mood.accent,
                        color: 'white',
                      }}
                    >
                      <div className="text-[9px] uppercase font-black opacity-80 leading-none">M{measureIdx + 1}</div>
                      <div className="text-xs md:text-sm font-black font-display leading-tight">{chord.label}</div>
                    </div>
                    <div className="grid gap-1.5 md:gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${SLOTS_PER_ROW}, minmax(0, 1fr))` }}>
                      {[0, 1, 2, 3].map((beatIdx) => {
                        const i = measureIdx * SLOTS_PER_ROW + beatIdx;
                        const noteId = slots[i];
                        const key = noteId ? PIANO_KEYS.find((k) => k.id === noteId) : null;
                        const isCursor = i === cursor && !isPlaying;
                        const isLit = playingSlot === i;
                        return (
                          <button
                            key={i}
                            data-testid={`slot-${i}`}
                            onClick={() => handleSlotTap(i)}
                            className="aspect-square rounded-lg border-2 flex flex-col items-center justify-center"
                            style={{
                              borderColor: 'var(--jma-dark)',
                              backgroundColor: isLit ? (key ? key.color : '#FFCC00') : (key ? key.color : 'white'),
                              borderStyle: noteId ? 'solid' : 'dashed',
                              boxShadow: isCursor ? `0 0 0 3px ${mood.accent}` : 'none',
                              transform: isLit ? 'scale(1.08)' : 'scale(1)',
                              transition: 'transform 0.1s, background-color 0.15s',
                            }}
                          >
                            {key ? (
                              <>
                                <span className="text-[10px] md:text-xs font-black font-display leading-none" style={{ color: 'var(--jma-dark)' }}>
                                  {key.solfege}
                                </span>
                                <span className="text-[8px] opacity-60 leading-none mt-0.5" style={{ color: 'var(--jma-dark)' }}>
                                  {key.octave}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] opacity-30 font-bold" style={{ color: 'var(--jma-dark)' }}>{i + 1}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PIANO KEYBOARD */}
        <div
          className="w-full overflow-x-auto pb-3"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex justify-center gap-1 md:gap-1.5 px-2 min-w-max">
            {PIANO_KEYS.map((k) => {
              const inScale = mood.scaleNotes.includes(k.pitch);
              const isTonic = k.pitch === mood.tonic;
              return (
                <ColoredKey
                  key={k.id}
                  keyDef={k}
                  scaleHighlighted={inScale}
                  isTonic={isTonic}
                  onTap={handleKeyTap}
                  playingNow={false}
                />
              );
            })}
          </div>
        </div>

        {/* ACCOMPANIMENT TOGGLES */}
        <div className="flex items-center justify-center gap-2 mt-1 mb-2 flex-wrap">
          <button
            data-testid="toggle-chords"
            onClick={() => setChordsOn((v) => !v)}
            aria-pressed={chordsOn}
            className="rounded-full border-2 px-3 py-1.5 flex items-center gap-1.5 text-xs md:text-sm font-black font-display"
            style={{
              borderColor: 'var(--jma-dark)',
              backgroundColor: chordsOn ? mood.accent : 'white',
              color: chordsOn ? 'white' : 'var(--jma-dark)',
              boxShadow: chordsOn ? '0 3px 0 0 var(--jma-dark)' : '0 2px 0 0 var(--jma-dark)',
              transition: 'background-color 0.15s, box-shadow 0.12s, transform 0.12s',
              transform: chordsOn ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            <Piano className="w-4 h-4" />
            Chords {chordsOn ? 'ON' : 'OFF'}
          </button>
          <button
            data-testid="toggle-drums"
            onClick={() => setDrumsOn((v) => !v)}
            aria-pressed={drumsOn}
            disabled={!mood.drumLoop}
            className="rounded-full border-2 px-3 py-1.5 flex items-center gap-1.5 text-xs md:text-sm font-black font-display disabled:opacity-40"
            style={{
              borderColor: 'var(--jma-dark)',
              backgroundColor: drumsOn && mood.drumLoop ? mood.accent : 'white',
              color: drumsOn && mood.drumLoop ? 'white' : 'var(--jma-dark)',
              boxShadow: drumsOn && mood.drumLoop ? '0 3px 0 0 var(--jma-dark)' : '0 2px 0 0 var(--jma-dark)',
              transition: 'background-color 0.15s, box-shadow 0.12s, transform 0.12s',
              transform: drumsOn && mood.drumLoop ? 'translateY(-1px)' : 'translateY(0)',
              cursor: mood.drumLoop ? 'pointer' : 'not-allowed',
            }}
            title={mood.drumLoop ? '' : 'No drum loop for this mood'}
          >
            <Drum className="w-4 h-4" />
            Drums {mood.drumLoop ? (drumsOn ? 'ON' : 'OFF') : '—'}
          </button>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button
            data-testid="song-play-btn"
            onClick={isPlaying ? stopPlayback : playSong}
            disabled={filledCount === 0}
            className="chunky-btn px-4 py-2 flex items-center gap-2"
            style={{
              backgroundColor: filledCount === 0 ? '#9CA3AF' : '#34A853',
              color: 'white',
              opacity: filledCount === 0 ? 0.6 : 1,
              cursor: filledCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Play className="w-4 h-4" /> {isPlaying ? 'Stop' : 'Play My Song'}
          </button>
          <button
            data-testid="song-save-btn"
            onClick={handleSave}
            disabled={filledCount === 0}
            className="chunky-btn px-4 py-2 flex items-center gap-2"
            style={{
              backgroundColor: filledCount === 0 ? '#9CA3AF' : '#FFCC00',
              color: 'var(--jma-dark)',
              opacity: filledCount === 0 ? 0.6 : 1,
              cursor: filledCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button
            data-testid="song-clear-btn"
            onClick={clearAll}
            className="chunky-btn bg-white text-[var(--jma-dark)] px-3 py-2 flex items-center gap-1.5 text-sm border-2"
            style={{ borderColor: 'var(--jma-dark)' }}
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <button
            data-testid="song-gallery-btn"
            onClick={() => setView('gallery')}
            className="chunky-btn bg-white text-[var(--jma-dark)] px-3 py-2 flex items-center gap-1.5 text-sm border-2"
            style={{ borderColor: 'var(--jma-dark)' }}
          >
            <BookOpen className="w-4 h-4" /> My Songs ({songs.length})
          </button>
        </div>

        {/* SAVE MODAL */}
        <AnimatePresence>
          {showSaveModal && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(10,37,64,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                data-testid="song-save-modal"
                className="bg-white rounded-3xl border-4 p-6 max-w-md w-full"
                style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }}
                initial={{ scale: 0.7 }} animate={{ scale: 1 }}
              >
                <h2 className="text-2xl font-black font-display mb-1 text-center" style={{ color: 'var(--jma-dark)' }}>
                  💾 Name your song!
                </h2>
                <p className="text-sm text-center mb-3 opacity-70" style={{ color: 'var(--jma-dark)' }}>
                  Then we'll add it to your gallery.
                </p>
                <input
                  data-testid="song-name-input"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-3 font-bold text-center"
                  style={{ borderColor: 'var(--jma-dark)' }}
                  maxLength={28}
                  autoFocus
                />
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="chunky-btn bg-white text-[var(--jma-dark)] px-4 py-2 border-2"
                    style={{ borderColor: 'var(--jma-dark)' }}
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="song-confirm-save"
                    onClick={confirmSave}
                    className="chunky-btn bg-[#34A853] text-white px-4 py-2"
                  >
                    Save it!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GALLERY MODAL */}
        <AnimatePresence>
          {view === 'gallery' && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(10,37,64,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                data-testid="song-gallery-modal"
                className="bg-white rounded-3xl border-4 p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
                style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }}
                initial={{ y: 30 }} animate={{ y: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-black font-display flex items-center gap-2" style={{ color: 'var(--jma-dark)' }}>
                    <Music className="w-5 h-5" /> My Songs
                  </h2>
                  <button
                    onClick={() => setView('compose')}
                    className="text-sm font-bold px-3 py-1 rounded-full border-2"
                    style={{ borderColor: 'var(--jma-dark)' }}
                  >
                    <ArrowLeft className="w-4 h-4 inline -mt-0.5" /> Back
                  </button>
                </div>
                {songs.length === 0 ? (
                  <p className="text-center py-6 opacity-70 font-bold" style={{ color: 'var(--jma-dark)' }}>
                    No songs yet. Compose and save one to fill this gallery!
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {songs.map((song) => {
                      const m = MOODS[song.moodId] || MOODS.happy;
                      return (
                        <li
                          key={song.id}
                          data-testid={`song-${song.id}`}
                          className="rounded-xl border-3 p-2 flex items-center gap-2"
                          style={{ borderColor: 'var(--jma-dark)', backgroundColor: `${m.color}22` }}
                        >
                          <div className="text-2xl">{m.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black font-display text-sm truncate" style={{ color: 'var(--jma-dark)' }}>
                              {song.name}
                            </div>
                            <div className="text-[10px] opacity-60" style={{ color: 'var(--jma-dark)' }}>
                              {m.name} · {song.bpm} BPM · {song.slots.filter((s) => s != null).length} notes
                            </div>
                          </div>
                          <button
                            onClick={() => loadSong(song)}
                            className="chunky-btn bg-[#34A853] text-white px-3 py-1.5 text-xs flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" /> Open
                          </button>
                          <button
                            onClick={() => deleteSong(song.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            aria-label="Delete song"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CELEBRATION */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Confetti count={36} size={420} />
              <motion.div
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className="bg-[#FFCC00] rounded-3xl border-4 px-6 py-4 text-center"
                style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }}
              >
                <div className="text-4xl mb-1">🎵</div>
                <div className="text-xl font-black font-display" style={{ color: 'var(--jma-dark)' }}>
                  Song saved!
                </div>
                <div className="text-xs font-bold opacity-70 mt-1" style={{ color: 'var(--jma-dark)' }}>
                  + Songwriter sticker
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
