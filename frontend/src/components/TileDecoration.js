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
      // bobbing above them. Fits Name That Note / Sight-Reading /
      // Note Match (chalkboard, staff-focused games).
      return (
        <div {...wrapProps}>
          <div
            className="absolute left-2 right-2"
            style={{
              top: '32%',
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
            { left: '18%', top: '30%', delay: 0 },
            { left: '48%', top: '36%', delay: 0.6 },
            { left: '72%', top: '30%', delay: 1.1 },
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
      // Fluffy cartoon clouds drifting through the WINDOW area of the
      // clubhouse.png background — a small right-of-center panel (roughly
      // 65-85% x 22-42% of the card). Container is constrained to that
      // window so the clouds appear to be seen through the frame, not
      // floating across the whole tile.
      const clouds = [
        { top: 4,  size: 22, dur: 11, delay: 0 },
        { top: 30, size: 30, dur: 15, delay: 3.5 },
        { top: 58, size: 18, dur: 9,  delay: 7 },
      ];
      return (
        <div
          aria-hidden="true"
          className="absolute pointer-events-none z-[5] overflow-hidden"
          style={{
            top: '22%',
            left: '65%',
            width: '20%',
            height: '20%',
          }}
        >
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
