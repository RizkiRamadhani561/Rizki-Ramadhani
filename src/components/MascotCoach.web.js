import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

// Mika uses the shared illustrated portrait. Web-only transforms add a 3D depth effect.
const mikaPortrait = require('../../assets/mika.jpg');

/** Responsive web version of Mika with perspective, float, hover tilt, and tap response. */
export default function MascotCoach({ completedCount, quizScore, onTapLessons, onStartQuiz }) {
  const [tipIndex, setTipIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  // The messages depend on study progress and the latest quiz score.
  const tips = [
    { title: 'Hai, aku Mika! ✨', message: 'Tap aku kapan saja untuk mendapat dorongan semangat belajar.' },
    { title: 'Pelan-pelan asal paham.', message: completedCount > 0 ? `Kamu sudah menuntaskan ${completedCount} dari 4 modul. Teruskan, ya!` : 'Mulai dari satu modul dulu. Nggak perlu buru-buru.' },
    { title: 'Siap tantangan kecil?', message: quizScore === null ? 'Coba kuis singkat untuk melihat konsep yang sudah kamu kuasai.' : `Skor terakhir kamu ${quizScore}%. Yuk, review materi yang masih menantang!` },
  ];

  /** Cycle to the next short coaching message when the character is tapped. */
  function showNextTip() {
    setTipIndex((current) => (current + 1) % tips.length);
  }

  const floatAnimation = reduceMotion ? {} : { y: [0, -5, 0], rotateZ: [-0.5, 0.5, -0.5] };
  const floatTransition = reduceMotion ? {} : {
    y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
    rotateZ: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
  };

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 12,
        minHeight: 146, width: '100%', boxSizing: 'border-box',
        background: '#FFFFFF', border: '1px solid #E1E4DC', borderRadius: 18,
        color: '#17211F', overflow: 'hidden',
      }}
      role="group"
      aria-label="Mika, teman belajar KULIAH LAB"
    >
      <div style={{ width: 91, minWidth: 91, height: 132, perspective: 850, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <motion.button
          type="button"
          onClick={showNextTip}
          aria-label="Minta tips belajar dari Mika"
          title="Tap Mika untuk tips belajar"
          animate={floatAnimation}
          transition={floatTransition}
          whileHover={reduceMotion ? {} : { rotateX: -5, rotateY: 9, scale: 1.035, z: 15 }}
          whileTap={reduceMotion ? {} : { scale: 0.96, rotateX: 2, z: 0 }}
          style={{
            display: 'block', width: 88, height: 128, padding: 0, border: 0,
            borderRadius: 15, overflow: 'hidden', cursor: 'pointer',
            background: '#F7F5EF', boxShadow: '0 7px 18px rgba(23,33,31,0.14)',
            transformPerspective: 850, transformStyle: 'preserve-3d',
          }}
        >
          <motion.img
            src={mikaPortrait}
            alt="Mika, karakter anime perempuan berambut panjang dengan jaket hijau dan tablet"
            draggable="false"
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          />
        </motion.button>
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? {} : { rotate: [0, 12, 0], scale: [1, 1.08, 1] }}
          transition={reduceMotion ? {} : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 1, right: 0, display: 'grid', placeItems: 'center',
            width: 25, height: 25, borderRadius: 20, background: '#C9F06A',
            color: '#1F5B4B', fontSize: 14, fontWeight: 900, pointerEvents: 'none',
          }}
        >✦</motion.span>
      </div>

      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ color: '#1F5B4B', fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>MIKA · STUDY BUDDY</div>
        <div aria-live="polite" style={{ color: '#17211F', fontSize: 16, fontWeight: 900, letterSpacing: -0.3, lineHeight: 1.2 }}>{tips[tipIndex].title}</div>
        <div style={{ color: '#65716B', fontSize: 12, lineHeight: 1.45 }}>{tips[tipIndex].message}</div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
          <motion.button
            type="button" onClick={showNextTip} whileTap={reduceMotion ? {} : { scale: 0.95 }}
            style={{ border: 0, borderRadius: 999, padding: '7px 10px', background: '#E2E9DF', color: '#1F5B4B', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >Tips lagi</motion.button>
          <motion.button
            type="button" onClick={onStartQuiz} whileHover={reduceMotion ? {} : { y: -1 }} whileTap={reduceMotion ? {} : { scale: 0.96 }}
            style={{ border: 0, borderRadius: 999, padding: '7px 10px', background: '#1F5B4B', color: '#FFFFFF', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >Mulai kuis</motion.button>
          <motion.button
            type="button" aria-label="Buka semua materi" onClick={onTapLessons}
            whileHover={reduceMotion ? {} : { x: 2 }} whileTap={reduceMotion ? {} : { scale: 0.94 }}
            style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, border: '1px solid #E1E4DC', borderRadius: 999, background: '#F7F5EF', color: '#1F5B4B', fontSize: 16, cursor: 'pointer' }}
          >→</motion.button>
        </div>
      </div>
    </div>
  );
}
