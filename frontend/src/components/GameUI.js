import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import HarpIcon from './HarpIcon';

function GameHeader({ title, score, streak, showHomeButton = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  // The harp button now acts as a "Back" button (browser history back)
  // rather than a hard-coded jump to Home. On the actual home page ("/")
  // we hide it entirely so kids don't accidentally back out of the app.
  const isOnHome = location.pathname === '/';
  const renderBackButton = showHomeButton && !isOnHome;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 md:px-4 py-1 md:py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-2">
        {renderBackButton && (
          <div className="flex flex-row md:flex-col items-end md:items-center gap-1.5 md:gap-1.5 flex-shrink-0">
            <motion.button
              data-testid="back-button"
              aria-label="Back"
              onClick={() => navigate(-1)}
              className="group flex flex-col items-center bg-transparent border-0 p-0 cursor-pointer pointer-events-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 2 }}
            >
              <div
                className="rounded-xl md:rounded-2xl border-2 md:border-3 border-[var(--jma-dark)] shadow-[0_3px_0_0_var(--jma-dark)] md:shadow-[0_4px_0_0_var(--jma-dark)] group-hover:shadow-[0_6px_0_0_var(--jma-dark)] transition-shadow w-12 h-12 md:w-14 md:h-14 lg:w-20 lg:h-20 overflow-hidden"
                style={{
                  backgroundColor: 'var(--jma-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <div style={{ width: '118%', height: '118%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HarpIcon />
                </div>
              </div>
              <span
                className="text-[10px] lg:text-sm font-black uppercase tracking-wide mt-1 px-2 lg:px-2.5 rounded-full"
                style={{
                  color: 'white',
                  backgroundColor: 'var(--jma-dark)',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                }}
              >
                Back
              </span>
            </motion.button>
          </div>
        )}

        {/* Title. Accepts a plain string (default cross-game styling) OR
            a ReactNode (per-game custom treatment). Robot Boogie uses
            this to render its own chrome/futurist title without
            affecting any other game's header. */}
        {title && (
          typeof title === 'string' ? (
            <motion.h1
              className="text-sm md:text-xl lg:text-2xl font-bold text-center font-display pt-1 md:pt-0 pointer-events-auto"
              style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3)' }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {title}
            </motion.h1>
          ) : (
            <div className="pointer-events-auto pt-1 md:pt-0">{title}</div>
          )
        )}

        {/* Score display */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {streak > 0 && (
            <motion.div
              className="game-card px-3 py-2 flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <span className="text-lg font-bold streak-fire">
                {streak}x
              </span>
            </motion.div>
          )}
          
          {score !== undefined && (
            <div className="game-card px-4 py-2">
              <span className="text-xl font-bold" style={{ color: 'var(--jma-dark)' }}>
                {score.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CharacterMascot({ character, position = 'left', message }) {
  const characterImages = {
    finn: 'assets/characters/finn-danger.png',
    charlie: 'assets/characters/charlie-polliwog.png',
    chunk: 'assets/characters/chunk.png',
    jazzy: 'assets/characters/jazzy.png',
    // Legacy aliases
    shark: 'assets/characters/finn-danger.png',
    catfish: 'assets/characters/charlie-polliwog.png'
  };

  return (
    <motion.div
      className={position === 'left' ? 'mascot-left' : 'mascot-right'}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    >
      <motion.img
        src={characterImages[character]}
        alt={character}
        className="w-full h-auto floating"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      {message && (
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl border-3 border-[var(--jma-dark)] whitespace-nowrap"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="font-bold text-sm">{message}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

function FeedbackPopup({ feedback, onComplete }) {
  const feedbackStyles = {
    perfect: { color: '#4CD964', text: 'PERFECT!' },
    great: { color: '#4285F4', text: 'GREAT!' },
    good: { color: '#FFCC00', text: 'GOOD!' },
    miss: { color: '#FF3B30', text: 'MISS!' }
  };

  const style = feedbackStyles[feedback] || feedbackStyles.good;

  return (
    <motion.div
      className="feedback-overlay"
      style={{ color: style.color }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={onComplete}
    >
      {style.text}
    </motion.div>
  );
}

function NotationDisplay({ currentNote, rhythm }) {
  return (
    <div className="notation-display flex items-center gap-4">
      <Volume2 className="w-5 h-5" />
      <div className="flex items-center gap-2">
        <span className="font-bold">Note:</span>
        <span className="text-xl font-bold" style={{ color: 'var(--jma-blue)' }}>
          {currentNote || '-'}
        </span>
      </div>
      {rhythm && (
        <div className="flex items-center gap-2">
          <span className="font-bold">Rhythm:</span>
          <span className="text-xl">{rhythm}</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ current, total, color = 'var(--jma-green)' }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="progress-bar-container w-full max-w-md">
      <div 
        className="progress-bar-fill"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
}

export { GameHeader, CharacterMascot, FeedbackPopup, NotationDisplay, ProgressBar };
