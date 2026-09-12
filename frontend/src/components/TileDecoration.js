// TileDecoration — CSS-only scene-appropriate overlay that lives BEHIND
// the character sprite but IN FRONT of the background image on each
// SubMenuPage tile. No new assets; all art is drawn with divs/spans and
// keyframe animations.
//
// Adding a new decoration:
//   1. Add a new `case` below returning JSX.
//   2. If needed, add a matching @keyframes block to index.css.
//   3. Set `decoration: 'your-key'` on the tile config in the menu file.

const noteChars = ['♪', '♫', '♩', '♬'];

export default function TileDecoration({ type, accent }) {
  if (!type) return null;

  const wrapProps = {
    'aria-hidden': true,
    className: 'absolute inset-0 pointer-events-none z-[5] overflow-hidden',
  };

  switch (type) {
    // ------------------------------------------------------------------
    case 'staff': {
      // 5 chalk staff lines drifting slowly leftward, with a few notes
      // bobbing above them. Fits Name That Note (chalkboard). Width is
      // clamped to ~80% of the card (left-[10%]/right-[10%]) so the
      // staff lines never poke past the chalkboard frame in the bg art.
      return (
        <div {...wrapProps}>
          <div
            className="absolute"
            style={{
              left: '12%',
              right: '12%',
              top: '34%',
              height: 46,
              opacity: 0.55,
              animation: 'tile-staff-drift 6s linear infinite',
            }}
          >
            {[0, 10, 20, 30, 40].map((y) => (
              <div
                key={y}
                className="absolute left-0 right-[-40px]"
                style={{
                  top: y,
                  height: 1.5,
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  borderRadius: 2,
                  boxShadow: '0 0 3px rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
          {[
            { left: '24%', top: '32%', delay: 0 },
            { left: '50%', top: '38%', delay: 0.6 },
            { left: '70%', top: '32%', delay: 1.1 },
          ].map((n, i) => (
            <span
              key={i}
              className="absolute font-black"
              style={{
                left: n.left,
                top: n.top,
                fontSize: 22,
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 0 rgba(10,37,64,0.35)',
                animation: `tile-note-bob 2.6s ease-in-out ${n.delay}s infinite`,
              }}
            >
              {noteChars[i % noteChars.length]}
            </span>
          ))}
        </div>
      );
    }

    // ------------------------------------------------------------------
    case 'clouds': {
      // Fluffy cartoon clouds + a rotating sun drifting through the
      // WINDOW area of the clubhouse.png background. Container is
      // constrained so the sky panel appears to be seen through the
      // window frame, not floating across the whole tile.
      const clouds = [
        { top: 18, size: 22, dur: 11, delay: 0 },
        { top: 46, size: 30, dur: 15, delay: 3.5 },
        { top: 72, size: 18, dur: 9,  delay: 7 },
      ];
      return (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-[5] overflow-hidden"
          style={{
            top: '27%',
            left: '65%',
            width: '20%',
            height: '20%',
          }}
        >
          {/* Cartoon sun — anchored top-right inside the window. Rays
              rotate slowly for a friendly shimmer. Sits BEHIND the
              clouds so drifting clouds partially cover the sun. */}
          <svg
            viewBox="0 0 40 40"
            style={{
              position: 'absolute',
              top: '4%',
              right: '6%',
              width: 30,
              height: 30,
              filter: 'drop-shadow(0 1px 0 rgba(10,37,64,0.4))',
            }}
          >
            <g style={{ transformOrigin: '20px 20px', animation: 'tile-sun-spin 24s linear infinite' }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <polygon
                  key={a}
                  points="20,2 22.5,10 17.5,10"
                  fill="#FFCC00"
                  stroke="#0A2540"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  transform={`rotate(${a} 20 20)`}
                />
              ))}
            </g>
            <circle
              cx="20"
              cy="20"
              r="8"
              fill="#FFD84D"
              stroke="#0A2540"
              strokeWidth="1.5"
            />
          </svg>
          {clouds.map((c, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: c.top + '%',
                left: 0,
                width: c.size,
                height: c.size * 0.55,
                background: 'radial-gradient(circle at 30% 60%, #FFFFFF 0%, #FFFFFF 60%, transparent 70%), radial-gradient(circle at 60% 40%, #FFFFFF 0%, #FFFFFF 55%, transparent 65%), radial-gradient(circle at 80% 65%, #FFFFFF 0%, #FFFFFF 55%, transparent 65%)',
                border: '1.5px solid var(--jma-dark)',
                borderRadius: '50%',
                opacity: 0.95,
                animation: `tile-cloud-drift ${c.dur}s linear ${c.delay}s infinite`,
              }}
            />
          ))}
        </div>
      );
    }

    // ------------------------------------------------------------------
    case 'notes': {
      // Music notes rising from below and fading out near the top. Best
      // for Jam Session / Jukebox / Beat Lab-style music tiles.
      const spots = [
        { left: '14%', size: 22, dur: 5.2, delay: 0 },
        { left: '30%', size: 28, dur: 6.6, delay: 1.4 },
        { left: '52%', size: 18, dur: 4.6, delay: 2.5 },
        { left: '70%', size: 26, dur: 6, delay: 0.7 },
        { left: '86%', size: 20, dur: 5.4, delay: 3.2 },
      ];
      return (
        <div {...wrapProps}>
          {spots.map((n, i) => (
            <span
              key={i}
              className="absolute font-black"
              style={{
                left: n.left,
                bottom: 8,
                fontSize: n.size,
                color: 'white',
                textShadow: '0 2px 0 var(--jma-dark), 0 0 8px rgba(255,255,255,0.4)',
                animation: `tile-note-rise ${n.dur}s ease-in ${n.delay}s infinite`,
              }}
            >
              {noteChars[i % noteChars.length]}
            </span>
          ))}
        </div>
      );
    }

    // ------------------------------------------------------------------
    case 'sparkles': {
      // Twinkling star field. Detective / Robot Boogie / clue-style
      // tiles. Twenty small stars scattered.
      const stars = [];
      for (let i = 0; i < 14; i++) {
        stars.push({
          top: `${8 + ((i * 37) % 68)}%`,
          left: `${(i * 47 + 9) % 92 + 3}%`,
          size: 4 + ((i * 13) % 8),
          dur: 1.4 + ((i * 0.13) % 1.6),
          delay: (i * 0.29) % 2.4,
        });
      }
      return (
        <div {...wrapProps}>
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                background: `radial-gradient(circle, #FFFFFF 0%, ${accent || '#FFCC00'} 55%, transparent 100%)`,
                boxShadow: `0 0 8px ${accent || '#FFCC00'}88`,
                animation: `tile-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>
      );
    }

    // ------------------------------------------------------------------
    case 'spotlight': {
      // Sweeping stage spotlight cone from the top. Music 101 curtain.
      return (
        <div {...wrapProps}>
          <div
            className="absolute"
            style={{
              top: -20,
              left: '50%',
              width: 240,
              height: 260,
              marginLeft: -120,
              transformOrigin: '50% 0%',
              background:
                'conic-gradient(from 260deg at 50% 0%, transparent 0deg, rgba(255,220,120,0.35) 40deg, rgba(255,220,120,0.55) 50deg, rgba(255,220,120,0.35) 60deg, transparent 100deg)',
              filter: 'blur(6px)',
              animation: 'tile-spotlight-sweep 5s ease-in-out infinite',
              mixBlendMode: 'screen',
            }}
          />
        </div>
      );
    }

    default:
      return null;
  }
}
