// Vimeo lesson player. Embeds the Vimeo iframe and listens for the `ended`
// event via the official @vimeo/player SDK to mark the lesson watched.
// When complete, the next lesson is auto-unlocked and a "Next Lesson" CTA appears.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Player from '@vimeo/player';
import { CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { LESSONS, getLesson } from '../data/lessons';
import { useLessonsProgress } from '../hooks/useLessonsProgress';

export default function LessonPlayerPage() {
  const { num } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(num);
  const lessonNum = Number(num);
  const { isUnlocked, isWatched, markWatched } = useLessonsProgress();
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);

  // Lesson 1 is always unlocked; for others, require previous to be watched.
  const allowed = lesson && isUnlocked(lessonNum);

  useEffect(() => {
    if (!allowed) return;
    if (!iframeRef.current) return;

    const player = new Player(iframeRef.current);
    playerRef.current = player;

    const onEnded = () => {
      markWatched(lessonNum);
      setCompleted(true);
    };
    player.on('ended', onEnded);

    return () => {
      try {
        player.off('ended', onEnded);
        player.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [allowed, lessonNum, markWatched]);

  // Reflect existing watched state on mount
  useEffect(() => {
    if (allowed && isWatched(lessonNum)) setCompleted(true);
  }, [allowed, isWatched, lessonNum]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6 text-center">
        <div>
          <h1 className="text-2xl font-black mb-3">Lesson not found</h1>
          <button
            className="mt-2 px-4 py-2 rounded-full bg-yellow-400 text-gray-900 font-black"
            onClick={() => navigate('/lessons')}
            data-testid="lesson-not-found-back"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div
        data-testid="lesson-locked-screen"
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative pt-16"
        style={{
          backgroundImage: 'url(assets/backgrounds/chalkboard.png)',
          backgroundSize: 'cover',
        }}
      >
        <GameHeader showHomeButton={true} />
        <motion.div
          className="bg-white rounded-3xl border-4 p-6 max-w-md w-full"
          style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 8px 0 0 var(--jma-dark)' }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-black font-display mb-2" style={{ color: 'var(--jma-dark)' }}>
            🔒 Lesson {lesson.num} is locked
          </h1>
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--jma-dark)' }}>
            Watch Lesson {lesson.num - 1} all the way to the end to unlock this one!
          </p>
          <button
            className="px-5 py-2.5 rounded-full bg-yellow-400 font-black border-3"
            style={{ color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)', boxShadow: '0 4px 0 0 var(--jma-dark)' }}
            onClick={() => navigate('/lessons')}
            data-testid="lesson-locked-back"
          >
            Back to Lessons
          </button>
        </motion.div>
      </div>
    );
  }

  const nextLesson = LESSONS.find((l) => l.num === lessonNum + 1);

  return (
    <div
      data-testid="lesson-player-page"
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-8 relative"
      style={{
        backgroundImage: 'url(assets/backgrounds/chalkboard.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <GameHeader showHomeButton={true} />

      <motion.div
        className="relative z-10 text-center mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1
          className="text-3xl md:text-5xl font-black font-display"
          style={{
            color: 'white',
            textShadow: '3px 3px 0 var(--jma-dark), 5px 5px 0 rgba(0,0,0,0.5)',
          }}
        >
          {lesson.title}
        </h1>
        <p
          className="mt-1 text-sm md:text-base font-bold"
          style={{ color: '#FFE9C4', textShadow: '1px 1px 0 rgba(0,0,0,0.7)' }}
        >
          {lesson.subtitle}
        </p>
      </motion.div>

      {/* Vimeo player */}
      <motion.div
        data-testid="lesson-player-frame"
        className="relative z-10 w-full max-w-4xl rounded-2xl border-4 overflow-hidden"
        style={{
          borderColor: 'var(--jma-dark)',
          boxShadow: '0 10px 0 0 var(--jma-dark)',
          aspectRatio: '16 / 9',
          backgroundColor: '#000',
        }}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <iframe
          ref={iframeRef}
          title={lesson.title}
          src={`https://player.vimeo.com/video/${lesson.vimeoId}?title=0&byline=0&portrait=0&dnt=1`}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        />
      </motion.div>

      {/* Watched banner + CTAs */}
      {completed && (
        <motion.div
          data-testid="lesson-completed-banner"
          className="relative z-10 mt-5 w-full max-w-2xl bg-white rounded-2xl border-4 p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'var(--jma-dark)', boxShadow: '0 6px 0 0 var(--jma-dark)' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" style={{ color: '#34A853' }} />
            <span className="font-black text-base md:text-lg" style={{ color: 'var(--jma-dark)' }}>
              {nextLesson ? `Great job! Lesson ${nextLesson.num} is unlocked!` : 'You finished every lesson! 🎉'}
            </span>
          </div>
          {nextLesson ? (
            <button
              data-testid="lesson-next-btn"
              onClick={() => {
                setCompleted(false);
                navigate(`/lessons/${nextLesson.num}`);
              }}
              className="px-4 py-2 rounded-full font-black border-3 flex items-center gap-1.5"
              style={{
                backgroundColor: '#FFCC00',
                color: 'var(--jma-dark)',
                borderColor: 'var(--jma-dark)',
                boxShadow: '0 4px 0 0 var(--jma-dark)',
              }}
            >
              Next Lesson <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              data-testid="lesson-finish-btn"
              onClick={() => navigate('/lessons')}
              className="px-4 py-2 rounded-full font-black border-3"
              style={{
                backgroundColor: '#34A853',
                color: 'white',
                borderColor: 'var(--jma-dark)',
                boxShadow: '0 4px 0 0 var(--jma-dark)',
              }}
            >
              Back to Lessons
            </button>
          )}
        </motion.div>
      )}

      {/* Helper row */}
      <div className="relative z-10 mt-4 flex items-center gap-3">
        <button
          data-testid="lesson-back-btn"
          onClick={() => navigate('/lessons')}
          className="px-3 py-1.5 rounded-full font-bold text-sm border-2"
          style={{ backgroundColor: 'white', color: 'var(--jma-dark)', borderColor: 'var(--jma-dark)' }}
        >
          ← All Lessons
        </button>
        {!completed && (
          <span className="text-xs md:text-sm font-bold flex items-center gap-1.5" style={{ color: '#FFE9C4', textShadow: '1px 1px 0 rgba(0,0,0,0.7)' }}>
            <RotateCcw className="w-3.5 h-3.5" /> Finish the video to unlock the next lesson
          </span>
        )}
      </div>
    </div>
  );
}
