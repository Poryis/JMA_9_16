// Chalkboard-themed lessons hub. Charlie introduces 7 Vimeo lessons.
// Each lesson tile is locked until the previous one is watched.
// Tapping an unlocked tile → /lessons/:num where the Vimeo player lives.

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { GameHeader } from '../components/GameUI';
import { LESSONS } from '../data/lessons';
import { useLessonsProgress } from '../hooks/useLessonsProgress';

function LessonTile({ lesson, index, locked, watched, onPlay }) {
  return (
    <motion.button
      type="button"
      data-testid={`lesson-${lesson.num}`}
      disabled={locked}
      onClick={() => !locked && onPlay(lesson.num)}
      className={`relative rounded-2xl border-4 p-4 flex flex-col items-center text-center ${
        locked ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        borderColor: 'var(--jma-dark)',
        backgroundColor: locked ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.96)',
        boxShadow: locked ? '0 4px 0 0 rgba(0,0,0,0.45)' : '0 8px 0 0 var(--jma-dark)',
        filter: locked ? 'grayscale(0.6)' : 'none',
      }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.06, type: 'spring' }}
      whileHover={!locked ? { y: -4, boxShadow: '0 12px 0 0 var(--jma-dark)' } : {}}
      whileTap={!locked ? { y: 2, boxShadow: '0 4px 0 0 var(--jma-dark)' } : {}}
    >
      {/* Status badge top-right */}
      <div className="absolute top-2 right-2 z-10">
        {watched ? (
          <div
            className="w-8 h-8 rounded-full border-3 flex items-center justify-center"
            style={{ backgroundColor: '#34A853', borderColor: 'var(--jma-dark)' }}
            data-testid={`lesson-${lesson.num}-watched`}
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        ) : locked ? (
          <div
            className="w-8 h-8 rounded-full border-3 flex items-center justify-center"
            style={{ backgroundColor: '#6B7280', borderColor: 'var(--jma-dark)' }}
            data-testid={`lesson-${lesson.num}-locked`}
          >
            <Lock className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full border-3 flex items-center justify-center"
            style={{ backgroundColor: '#FFCC00', borderColor: 'var(--jma-dark)' }}
            data-testid={`lesson-${lesson.num}-unlocked`}
          >
            <PlayCircle className="w-5 h-5" style={{ color: 'var(--jma-dark)' }} />
          </div>
        )}
      </div>

      {/* Big lesson number */}
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 flex items-center justify-center mb-2 mt-1"
        style={{
          backgroundColor: locked ? '#9CA3AF' : '#34A853',
          borderColor: 'var(--jma-dark)',
          boxShadow: '0 4px 0 0 var(--jma-dark)',
        }}
      >
        <span
          className="text-2xl md:text-3xl font-black font-display"
          style={{ color: 'white', textShadow: '2px 2px 0 rgba(0,0,0,0.35)' }}
        >
          {lesson.num}
        </span>
      </div>

      <h3
        className="text-base md:text-lg font-black font-display leading-tight"
        style={{ color: 'var(--jma-dark)' }}
      >
        {lesson.title}
      </h3>
      <p
        className="text-[10px] md:text-xs font-bold uppercase tracking-wide mt-0.5"
        style={{ color: locked ? '#6B7280' : 'var(--jma-orange)' }}
      >
        {locked ? 'Locked' : lesson.subtitle}
      </p>
    </motion.button>
  );
}

export default function LessonsPage() {
  const navigate = useNavigate();
  const { isUnlocked, isWatched, watched } = useLessonsProgress();
  const total = LESSONS.length;
  const watchedCount = watched.length;

  return (
    <div
      data-testid="lessons-page"
      className="min-h-screen flex flex-col items-center px-3 sm:px-6 pt-16 md:pt-20 pb-8 relative"
      style={{
        backgroundImage: 'url(assets/backgrounds/chalkboard.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <GameHeader showHomeButton={true} backLink={{ to: '/learn', label: 'Learn' }} />

      <motion.div
        className="relative z-10 text-center mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1
          className="text-4xl md:text-6xl font-black font-display"
          style={{
            color: 'white',
            textShadow: '3px 3px 0 var(--jma-dark), 5px 5px 0 rgba(0,0,0,0.5)',
          }}
        >
          Lessons 1–7
        </h1>
        <p
          className="mt-2 text-sm md:text-base font-bold"
          style={{ color: '#FFE9C4', textShadow: '1px 1px 0 rgba(0,0,0,0.7)' }}
        >
          Watch each lesson to unlock the next!
        </p>
      </motion.div>

      {/* Progress pill */}
      <motion.div
        data-testid="lessons-progress"
        className="relative z-10 mb-4 px-4 py-2 rounded-full border-3 flex items-center gap-2"
        style={{
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderColor: 'var(--jma-dark)',
          boxShadow: '0 4px 0 0 var(--jma-dark)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <CheckCircle2 className="w-5 h-5" style={{ color: '#34A853' }} />
        <span className="text-sm md:text-base font-black" style={{ color: 'var(--jma-dark)' }}>
          {watchedCount} / {total} watched
        </span>
      </motion.div>

      {/* Charlie at the chalkboard */}
      <motion.img
        src="assets/characters/charlie-grad.png"
        alt="Charlie"
        className="relative z-10 mb-3 object-contain"
        style={{ width: 'min(28vw, 140px)', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        draggable={false}
      />

      {/* Lessons grid */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {LESSONS.map((lesson, i) => (
          <LessonTile
            key={lesson.num}
            lesson={lesson}
            index={i}
            locked={!isUnlocked(lesson.num)}
            watched={isWatched(lesson.num)}
            onPlay={(num) => navigate(`/lessons/${num}`)}
          />
        ))}
      </div>
    </div>
  );
}
