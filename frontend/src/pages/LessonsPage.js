// Lessons page - placeholder ready for video integration.
// Once the partner picks a video host (Vimeo recommended), we'll fill in
// VIDEO_LIBRARY with { id, title, vimeoId / src, thumbnail } and render a
// Netflix-style tile grid that opens a fullscreen player.

import { motion } from 'framer-motion';
import { GameHeader } from '../components/GameUI';
import { GraduationCap } from 'lucide-react';

const LESSONS = Array.from({ length: 8 }).map((_, i) => ({
  num: i + 1,
  title: `Lesson ${i + 1}`,
  subtitle: 'Coming soon',
}));

function LessonsPage() {
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
      <GameHeader showHomeButton={true} />

      <motion.div
        className="relative z-10 text-center mb-5 md:mb-7"
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
          Lessons 1–8
        </h1>
        <p
          className="mt-2 text-sm md:text-base font-bold"
          style={{ color: '#FFE9C4', textShadow: '1px 1px 0 rgba(0,0,0,0.7)' }}
        >
          Charlie's chalkboard classroom
        </p>
      </motion.div>

      {/* Charlie at the chalkboard */}
      <motion.img
        src="assets/characters/charlie-grad.png"
        alt="Charlie"
        className="relative z-10 mb-4 object-contain"
        style={{ width: 'min(40vw, 180px)', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        draggable={false}
      />

      {/* Lessons grid */}
      <div className="relative z-10 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {LESSONS.map((lesson, i) => (
          <motion.div
            key={lesson.num}
            data-testid={`lesson-${lesson.num}`}
            className="relative rounded-2xl border-3 p-3 md:p-4 flex flex-col items-center text-center cursor-not-allowed opacity-90"
            style={{
              borderColor: 'var(--jma-dark)',
              backgroundColor: 'rgba(255,255,255,0.92)',
              boxShadow: '0 6px 0 0 rgba(0,0,0,0.4)',
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06, type: 'spring' }}
          >
            <div
              className="w-12 h-12 rounded-full border-3 flex items-center justify-center mb-1"
              style={{ backgroundColor: '#34A853', borderColor: 'var(--jma-dark)' }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-black font-display" style={{ color: 'var(--jma-dark)' }}>
              {lesson.title}
            </h3>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--jma-orange)' }}>
              {lesson.subtitle}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="relative z-10 mt-6 text-xs md:text-sm font-bold text-center max-w-md px-4 py-2 rounded-2xl"
        style={{
          color: 'white',
          backgroundColor: 'rgba(10,37,64,0.85)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Video lessons are coming soon! Each lesson will play right here.
      </motion.p>
    </div>
  );
}

export default LessonsPage;
