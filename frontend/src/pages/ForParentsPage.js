// For-Parents Landing Page — the marketing/sales-pitch page.
//
// SMART ROUTING: on `/` (root) we check if the visitor has a stored player
// profile in localStorage. If they do → straight to the kid Home. If not
// → land them here so the parent gets the pitch before their kid grabs
// the tablet. Returning parents can always reach this page via the
// "For Parents" link in the Home header.
//
// Currently a MARKETING page only — pricing buttons drop into the free
// app for now. When Path C (Stripe) ships, the pricing buttons will
// route into the Stripe Checkout flow.

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';

// Character strip — the same faces the kid will meet in the app. Selling
// personality is 80% of the "will my kid love this?" pitch.
const BAND = [
  { name: 'Charlie',       image: 'assets/characters/charlie.png',         bio: 'Rock-star tadpole who leads the band.' },
  { name: 'Finn Danger',   image: 'assets/characters/finn-danger.png',     bio: 'Drummer shark. Loud, brave, unstoppable.' },
  { name: 'Stew',          image: 'assets/characters/stew.png',            bio: 'Kazoo-blowing parrot with big opinions.' },
  { name: 'Lou',           image: 'assets/characters/lou.png',             bio: 'Ukulele llama, seen the whole world.' },
  { name: 'Chunk',         image: 'assets/characters/chunk.png',           bio: 'Bass-line hippo. Steady as they come.' },
  { name: 'Dr. Jellybone', image: 'assets/characters/dr-jellybone.png',    bio: 'Music detective with the sharpest ear.' },
  { name: 'Jazzy',         image: 'assets/characters/jazzy.png',           bio: 'Keys player. Turns anything into a song.' },
];

const WHY_PARENTS = [
  { title: 'No ads. Ever.',           body: 'Zero third-party ads, zero data brokers, zero “upgrade to premium” pop-ups inside the kid’s view.' },
  { title: 'COPPA-safe by design',    body: 'Kids’ progress lives on their device. No emails, no last names, no facial recognition, no location.' },
  { title: 'Made by a working band',  body: 'JMA was built by Jelly of the Month Club — a real touring kindie-rock band, not a Silicon Valley content mill.' },
  { title: 'Screen time you feel good about',
    body: 'Every game teaches a real music skill. Every video pairs a laugh with a fact. Every rank-up is proof your kid learned something.' },
];

const PRICING = [
  {
    id: 'free',
    tier: 'Free',
    price: '$0',
    cadence: 'forever',
    highlight: false,
    features: [
      '2 games unlocked',
      'Fun Facts Clubhouse',
      'First 3 lessons',
      'Basic sticker collection',
    ],
    cta: 'Start Free',
    ctaHint: 'No credit card. No signup.',
  },
  {
    id: 'family',
    tier: 'Family',
    price: '$12.99',
    cadence: '/ month',
    yearly: '$99 / year — save 36%',
    highlight: true,
    ribbon: 'Most Popular',
    features: [
      'Everything unlocked',
      'Up to 4 kid profiles',
      'Full lesson library',
      'All achievement badges & ranks',
      'JMAtv full library',
    ],
    cta: 'Start 14-Day Free Trial',
    ctaHint: 'Cancel anytime.',
  },
  {
    id: 'teacher',
    tier: 'Teacher',
    price: '$19.99',
    cadence: '/ month',
    yearly: '$149 / year — save 38%',
    highlight: false,
    features: [
      'Everything in Family',
      'Class codes for up to 30 students',
      'Roster + progress dashboard',
      'Report cards',
      'District/school pricing available',
    ],
    cta: 'Try Free for 30 Days',
    ctaHint: 'Purchase Orders welcome.',
  },
];

export default function ForParentsPage() {
  const navigate = useNavigate();
  const parentPageRef = useRef(null);

  // If a parent lands here but their kid already has a profile, we still
  // stay on this page (they clicked "For Parents" deliberately). But if
  // this is the FIRST visit and no profile exists yet, we're the right
  // page — no redirect either way. The routing decision happens at `/`
  // (see App.js RootGate).
  useEffect(() => {
    parentPageRef.current?.scrollTo?.({ top: 0 });
  }, []);

  const goToApp = () => navigate('/home');

  return (
    <div
      ref={parentPageRef}
      data-testid="for-parents-page"
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: 'linear-gradient(180deg, #BCE5F2 0%, #E5F2F8 40%, #FFF8E8 100%)',
      }}
    >
      {/* Header bar with "Take Me to the App" escape hatch */}
      <header className="w-full flex items-center justify-between px-4 md:px-10 py-4 relative z-20">
        <img
          src="assets/ui/logo.png"
          alt="Jelly of the Month Club Music Academy"
          className="object-contain"
          style={{ width: 'clamp(80px, 12vw, 140px)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}
        />
        <button
          data-testid="parents-goto-app"
          onClick={goToApp}
          className="px-4 md:px-6 py-2 md:py-3 rounded-full font-black text-sm md:text-base transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#5A2989', color: 'white', boxShadow: '0 4px 12px rgba(90,41,137,0.35)' }}
        >
          Take Me to the App →
        </button>
      </header>

      {/* HERO */}
      <section className="relative px-4 md:px-10 pt-6 md:pt-10 pb-14 md:pb-20 text-center max-w-6xl mx-auto">
        <motion.h1
          className="font-black leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)', color: 'var(--jma-dark, #1a1a2e)' }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
        >
          Where kids fall in love with music.
        </motion.h1>
        <motion.p
          className="mx-auto mb-8 max-w-3xl"
          style={{ fontSize: 'clamp(1rem, 1.8vw, 1.35rem)', color: '#334155' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          6 skill-building games, 7 video lessons, and a whole musical universe
          kids ask to come back to. Ages 4–10.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            data-testid="parents-hero-start-playing"
            onClick={goToApp}
            className="px-8 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#FF3B30', color: 'white', boxShadow: '0 8px 20px rgba(255,59,48,0.35)' }}
          >
            Start Playing Free
          </button>
          <button
            data-testid="parents-hero-teacher"
            onClick={() => {
              document.querySelector('[data-testid="parents-pricing"]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'white', color: '#5A2989', border: '3px solid #5A2989' }}
          >
            I&apos;m a Teacher →
          </button>
        </motion.div>

        {/* Bopping character parade — just fun to look at */}
        <div className="flex items-end justify-center gap-2 md:gap-4 flex-wrap pt-4">
          {BAND.slice(0, 5).map((c, i) => (
            <motion.img
              key={c.name}
              src={c.image}
              alt={c.name}
              className="object-contain"
              style={{ width: 'clamp(60px, 8vw, 110px)', height: 'auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.2))' }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: [0, -6, 0], opacity: 1 }}
              transition={{
                y: { duration: 1.8 + i * 0.15, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 },
                opacity: { delay: 0.5 + i * 0.08 },
              }}
            />
          ))}
        </div>
      </section>

      {/* WHAT IS THIS strip — 3 quick value props */}
      <section className="px-4 md:px-10 py-10 md:py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: '🎮', title: '6+ Games',                body: 'Rhythm, ear-training, sight-reading, sound detective, and more. Every game teaches a real music skill.' },
            { icon: '📺', title: 'Video Lessons + JMAtv',    body: 'Cartoon lessons and short fact-bites. Screen time that actually teaches your kid something.' },
            { icon: '🏅', title: 'Real Progression',        body: 'Kids earn badges across 6 music skills and rank up from Polliwog to Maestro. No gimmicks, real mastery.' },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              className="rounded-3xl p-6 md:p-7"
              style={{ backgroundColor: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-2">{v.icon}</div>
              <h3 className="font-black text-xl mb-2" style={{ color: 'var(--jma-dark, #1a1a2e)' }}>{v.title}</h3>
              <p className="text-slate-600 text-sm md:text-base">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY PARENTS LOVE IT */}
      <section className="px-4 md:px-10 py-10 md:py-16 max-w-6xl mx-auto">
        <h2 className="font-black text-center mb-8" style={{ fontSize: 'clamp(1.6rem, 3.6vw, 2.5rem)', color: 'var(--jma-dark, #1a1a2e)' }}>
          Why parents love JMA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {WHY_PARENTS.map((p, i) => (
            <motion.div
              key={p.title}
              className="flex items-start gap-4 rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.65)', border: '2px solid rgba(90,41,137,0.15)' }}
              initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                style={{ backgroundColor: '#4CD964' }}
                aria-hidden="true"
              >
                ✓
              </div>
              <div>
                <h4 className="font-black text-lg mb-1" style={{ color: 'var(--jma-dark, #1a1a2e)' }}>{p.title}</h4>
                <p className="text-slate-600 text-sm md:text-base">{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MEET THE BAND — the "superpower" section per the audit */}
      <section className="px-4 md:px-10 py-10 md:py-16 max-w-6xl mx-auto">
        <h2 className="font-black text-center mb-2" style={{ fontSize: 'clamp(1.6rem, 3.6vw, 2.5rem)', color: 'var(--jma-dark, #1a1a2e)' }}>
          Meet the Band
        </h2>
        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
          Kids don&apos;t remember worksheets. They remember characters. JMA has seven.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {BAND.map((c) => (
            <motion.div
              key={c.name}
              className="flex flex-col items-center text-center p-3 rounded-2xl"
              style={{ backgroundColor: 'white', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <img
                src={c.image}
                alt={c.name}
                className="object-contain mb-2"
                style={{ height: 'clamp(80px, 12vw, 130px)', width: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
              />
              <h5 className="font-black text-base" style={{ color: 'var(--jma-dark, #1a1a2e)' }}>{c.name}</h5>
              <p className="text-slate-500 text-xs md:text-sm mt-1">{c.bio}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-slate-700 text-sm md:text-base max-w-3xl mx-auto">
            <strong>Jelly of the Month Club</strong> is a real, touring kindie-rock band.
            JMA is our kids&apos; music academy. If you love the app,{' '}
            <a
              href="https://www.jellyofthemonthclub.com"
              target="_blank"
              rel="noreferrer"
              className="underline font-black"
              style={{ color: '#5A2989' }}
            >
              come see us live →
            </a>
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section data-testid="parents-pricing" className="px-4 md:px-10 py-10 md:py-16 max-w-6xl mx-auto">
        <h2 className="font-black text-center mb-2" style={{ fontSize: 'clamp(1.6rem, 3.6vw, 2.5rem)', color: 'var(--jma-dark, #1a1a2e)' }}>
          Pick your plan
        </h2>
        <p className="text-center text-slate-600 mb-8">Start free. Upgrade when your kid is hooked. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PRICING.map((tier) => (
            <div
              key={tier.id}
              data-testid={`parents-pricing-${tier.id}`}
              className="relative rounded-3xl p-6 md:p-7 flex flex-col"
              style={{
                backgroundColor: 'white',
                boxShadow: tier.highlight
                  ? '0 15px 40px rgba(90,41,137,0.25)'
                  : '0 8px 20px rgba(0,0,0,0.08)',
                border: tier.highlight ? '3px solid #5A2989' : '2px solid rgba(0,0,0,0.05)',
                transform: tier.highlight ? 'scale(1.03)' : 'none',
              }}
            >
              {tier.ribbon && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white"
                  style={{ backgroundColor: '#FF3B30' }}
                >
                  {tier.ribbon}
                </div>
              )}
              <h3 className="font-black text-2xl mb-1" style={{ color: 'var(--jma-dark, #1a1a2e)' }}>{tier.tier}</h3>
              <div className="mb-1">
                <span className="font-black text-4xl" style={{ color: 'var(--jma-dark, #1a1a2e)' }}>{tier.price}</span>
                <span className="text-slate-500 ml-1">{tier.cadence}</span>
              </div>
              {tier.yearly && (
                <p className="text-xs font-bold mb-4" style={{ color: '#4CD964' }}>{tier.yearly}</p>
              )}
              {!tier.yearly && <div className="mb-4" />}
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-700 text-sm md:text-base">
                    <span aria-hidden="true" style={{ color: '#4CD964' }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                data-testid={`parents-pricing-${tier.id}-cta`}
                onClick={goToApp}
                className="w-full py-3 rounded-full font-black transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: tier.highlight ? '#FF3B30' : '#5A2989',
                  color: 'white',
                  boxShadow: tier.highlight
                    ? '0 6px 16px rgba(255,59,48,0.35)'
                    : '0 4px 12px rgba(90,41,137,0.25)',
                }}
              >
                {tier.cta}
              </button>
              <p className="text-xs text-slate-500 mt-2 text-center">{tier.ctaHint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEACHER STRIP */}
      <section className="px-4 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
        <div
          className="rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6"
          style={{
            background: 'linear-gradient(135deg, #5A2989 0%, #7A1F1F 100%)',
            color: 'white',
          }}
        >
          <img
            src="assets/characters/charlie-grad.png"
            alt="Professor Charlie"
            className="object-contain"
            style={{ width: 'clamp(90px, 12vw, 150px)' }}
          />
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-black text-2xl md:text-3xl mb-2">For classrooms and homeschools</h3>
            <p className="opacity-90 mb-4">
              Class codes, no-PII kid logins, roster management, progress dashboards, and printable
              report cards. COPPA + FERPA aligned. We&apos;ll happily sign your district&apos;s DPA.
            </p>
            <button
              data-testid="parents-teacher-contact"
              onClick={() => window.location.href = 'mailto:hi@jmalearning.com?subject=Classroom%20inquiry'}
              className="px-6 py-3 rounded-full font-black transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'white', color: '#5A2989' }}
            >
              Talk to us about your classroom →
            </button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 md:px-10 py-10 md:py-16 text-center max-w-4xl mx-auto">
        <h2 className="font-black mb-4" style={{ fontSize: 'clamp(1.6rem, 3.6vw, 2.5rem)', color: 'var(--jma-dark, #1a1a2e)' }}>
          Ready when you are.
        </h2>
        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
          Hand your kid the tablet. Let them meet the band. Come back when the paywall matters.
        </p>
        <button
          data-testid="parents-final-cta"
          onClick={goToApp}
          className="px-10 py-5 rounded-full font-black text-xl transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#FF3B30', color: 'white', boxShadow: '0 10px 24px rgba(255,59,48,0.4)' }}
        >
          Start Playing Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer className="px-4 md:px-10 py-8 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div>© Luner Tide LLC dba Buddy Bro Productions</div>
          <div className="flex gap-4 flex-wrap justify-center">
            <a href="#/for-parents" className="hover:text-slate-800">About</a>
            <a href="mailto:hi@jmalearning.com" className="hover:text-slate-800">Contact</a>
            <a href="https://www.jellyofthemonthclub.com" target="_blank" rel="noreferrer" className="hover:text-slate-800">See Us Live</a>
            <span className="opacity-60">Privacy · Terms (coming soon)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
