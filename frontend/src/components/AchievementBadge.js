// AchievementBadge — the bronze/silver/gold enamel-badge styling for
// Achievement Stickers. Visually distinct from round Collection stickers
// so a kid (and a teacher) can instantly tell skill-badges from flair.
//
// Sizes: 'sm' (sticker-book cell), 'md' (modals/toasts), 'lg' (hero blocks).

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { DOMAIN_MAP, TIER_MAP } from '../data/achievements';

const SIZES = {
  sm: { box: 84,  iconImg: 36, tierFs: 9,  nameFs: 9,  ribbonH: 16 },
  md: { box: 120, iconImg: 56, tierFs: 11, nameFs: 11, ribbonH: 22 },
  lg: { box: 160, iconImg: 76, tierFs: 13, nameFs: 12, ribbonH: 28 },
};

export default function AchievementBadge({
  domain,
  tier,
  earned = false,
  size = 'md',
  showName = true,
  onClick,
  testId,
}) {
  const dom = DOMAIN_MAP[domain];
  const tr  = TIER_MAP[tier];
  const dims = SIZES[size] || SIZES.md;
  if (!dom || !tr) return null;

  const interactive = !!onClick;
  const dimmed = !earned;

  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.06, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      className="relative flex flex-col items-center select-none focus:outline-none"
      style={{
        width: dims.box,
        cursor: interactive ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0,
      }}
    >
      {/* Star/shield shape — uses CSS clip-path for the badge silhouette */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: dims.box,
          height: dims.box,
          // Outer ring (the metal frame)
          background: dimmed
            ? `linear-gradient(180deg, #C7CED5 0%, #8E96A0 100%)`
            : `linear-gradient(180deg, ${tr.frameHi} 0%, ${tr.frame} 100%)`,
          clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 65%, 80% 90%, 50% 100%, 20% 90%, 0% 65%, 0% 35%, 20% 10%)',
          filter: dimmed
            ? 'grayscale(0.6) brightness(0.85) drop-shadow(0 4px 6px rgba(0,0,0,0.18))'
            : `drop-shadow(0 6px 10px ${tr.frame}80)`,
          transition: 'filter 0.2s',
        }}
      >
        {/* Inner enamel disc */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '74%',
            height: '74%',
            background: dimmed
              ? '#F6F7F9'
              : `radial-gradient(circle at 30% 25%, ${dom.color}22 0%, white 70%, ${dom.color}33 100%)`,
            borderRadius: '50%',
            border: `2px solid ${dimmed ? '#B8C0CA' : tr.frameHi}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Domain icon — small portrait */}
          <img
            src={dom.icon}
            alt={dom.label}
            draggable={false}
            style={{
              width: dims.iconImg,
              height: dims.iconImg,
              objectFit: 'contain',
              opacity: dimmed ? 0.45 : 1,
              filter: dimmed ? 'grayscale(0.8)' : 'none',
            }}
          />
          {dimmed && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.55)' }}
            >
              <Lock className="opacity-70" style={{ width: dims.iconImg * 0.45, height: dims.iconImg * 0.45, color: '#5F676E' }} />
            </div>
          )}
        </div>
      </div>

      {/* Tier ribbon */}
      <div
        className="relative mt-[-12px] font-black font-display tracking-wider text-center"
        style={{
          backgroundColor: dimmed ? '#7C848E' : tr.ribbonBg,
          color: 'white',
          padding: `0 ${dims.ribbonH * 0.6}px`,
          height: dims.ribbonH,
          lineHeight: `${dims.ribbonH}px`,
          fontSize: dims.tierFs,
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
          minWidth: dims.box * 0.55,
          boxShadow: '0 2px 0 0 rgba(0,0,0,0.25)',
          zIndex: 2,
        }}
      >
        {tr.ribbon}
      </div>

      {showName && (
        <div
          className="text-center mt-1.5 font-black font-display leading-tight"
          style={{
            fontSize: dims.nameFs,
            color: 'var(--jma-dark)',
            opacity: dimmed ? 0.55 : 1,
            maxWidth: dims.box * 1.1,
          }}
        >
          {dom.label}
        </div>
      )}
    </motion.button>
  );
}
