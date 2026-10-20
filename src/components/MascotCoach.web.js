import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const mikaPortrait = 'https://gcdn.picsart.com/pipeline-output/ecfeab13-e1a4-4a84-aec2-e81c25ffcdfe.png';
const calmReaction = { title: 'Hai, aku Mika! ✨', message: 'Sentuh aku untuk melihat reaksiku. Tapi jangan jahil berkali-kali, ya!', emoji: '💚' };

export default function MascotCoach({ completedCount, quizScore, onTapLessons, onStartQuiz }) {
  const [reaction, setReaction] = useState(calmReaction);
  const [mood, setMood] = useState('happy');
  const [tapStreak, setTapStreak] = useState(0);
  const [animationVersion, setAnimationVersion] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const tapState = useRef({ count: 0, lastTap: 0 });
  const angerTimer = useRef(null);
  const reduceMotion = useReducedMotion();
  const tips = [
    { title: 'Tips fokus 🎯', message: 'Belajar 15 menit, istirahat sebentar, lalu jelaskan konsep dengan kata-katamu sendiri.' },
    { title: 'Ingat konsepnya 🧠', message: completedCount > 0 ? 'Kamu sudah menyelesaikan ' + completedCount + ' dari 4 modul. Teruskan, ya!' : 'Mulai dari satu modul dulu. Nggak perlu buru-buru.' },
    { title: 'Ayo latihan ⚡', message: quizScore === null ? 'Kerjakan kuis untuk mengetahui konsep yang perlu diulang.' : 'Skor terakhirmu ' + quizScore + '%. Yuk, pecahkan rekor itu!' },
  ];

  useEffect(() => () => { if (angerTimer.current) clearTimeout(angerTimer.current); }, []);

  function reactAs(nextMood, title, message, emoji) {
    setMood(nextMood);
    setReaction({ title, message, emoji });
    setAnimationVersion((version) => version + 1);
  }

  function onCharacterTap() {
    const now = Date.now();
    const nextCount = now - tapState.current.lastTap <= 2300 ? tapState.current.count + 1 : 1;
    tapState.current = { count: nextCount, lastTap: now };
    setTapStreak(nextCount);
    if (nextCount >= 4) {
      reactAs('angry', 'Ih, jangan dicolek terus! 😤', 'Mika kesal kalau disentuh empat kali berturut-turut. Kasih camilan atau tunggu sebentar, ya!', '💢');
      if (angerTimer.current) clearTimeout(angerTimer.current);
      angerTimer.current = setTimeout(() => {
        tapState.current = { count: 0, lastTap: 0 };
        setTapStreak(0);
        reactAs('happy', 'Sudah baikan! 💚', 'Makasih sudah kasih Mika waktu tenang. Kita lanjut belajar, yuk!', '✨');
      }, 4200);
      return;
    }
    const reactions = [
      { mood: 'happy', title: 'Hehe, halo juga! ✨', message: 'Mika senang kamu mampir. Ada yang mau dipelajari hari ini?', emoji: '💚' },
      { mood: 'surprised', title: 'Eh! Kaget aku! 😳', message: 'Wah, sentuhan kedua! Ajak Mika tos, dong.', emoji: '❗' },
      { mood: 'happy', title: 'Yeay, semangat! 🌟', message: 'Mika loncat kegirangan! Satu konsep kecil juga sebuah kemajuan.', emoji: '⭐' },
    ];
    const item = reactions[nextCount - 1];
    reactAs(item.mood, item.title, item.message, item.emoji);
  }

  function doAction(action) {
    if (angerTimer.current) clearTimeout(angerTimer.current);
    tapState.current = { count: 0, lastTap: 0 };
    setTapStreak(0);
    if (action === 'snack') reactAs('happy', 'Camilan diterima! 🍪', 'Makasih! Mika sudah nggak marah. Kamu baik banget.', '🍪');
    else reactAs('surprised', 'Tos dulu! ✋', 'Yosh! High-five buat kamu. Sekarang kita siap menaklukkan materi.', '✋');
  }

  function showNextTip() {
    const nextIndex = (tipIndex + 1) % tips.length;
    setTipIndex(nextIndex);
    reactAs('happy', tips[nextIndex].title, tips[nextIndex].message, '💡');
  }

  const characterMotion = mood === 'angry'
    ? { x: [0, -9, 9, -8, 8, 0], rotateZ: [0, -4, 4, -4, 4, 0], scale: [1, 1.04, 1] }
    : mood === 'surprised'
      ? { y: [0, -18, 0], rotateZ: [0, 3, -2, 0], scale: [1, 1.1, 1] }
      : { y: [0, -8, 0], rotateZ: [0, 2, -2, 0], scale: [1, 1.05, 1] };
  const reactionTransition = mood === 'angry'
    ? { duration: 0.46, repeat: 2, ease: 'easeInOut' }
    : { duration: reduceMotion ? 0 : 0.58, ease: 'easeInOut' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, minHeight: 188, width: '100%', boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #E1E4DC', borderRadius: 20, color: '#17211F', overflow: 'hidden' }} role="group" aria-label="Mika, karakter interaktif KULIAH LAB">
      <div style={{ width: 105, minWidth: 105, minHeight: 164, perspective: 850, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <motion.button type="button" onClick={onCharacterTap} aria-label="Sentuh Mika untuk melihat reaksinya" title="Empat sentuhan cepat membuat Mika kesal" whileTap={reduceMotion ? {} : { scale: 0.92, rotateX: 5 }} style={{ position: 'relative', display: 'block', width: 102, height: 150, padding: 0, border: 0, borderRadius: 17, overflow: 'hidden', cursor: 'pointer', background: '#F7F5EF', boxShadow: mood === 'angry' ? '0 7px 18px rgba(185,78,61,0.22)' : '0 7px 18px rgba(23,33,31,0.14)', transformPerspective: 850, transformStyle: 'preserve-3d' }}>
          <motion.img key={animationVersion} src={mikaPortrait} alt="Mika, karakter anime berambut cokelat panjang, memakai hoodie hijau dan membawa tablet" draggable="false" animate={reduceMotion ? {} : characterMotion} transition={reactionTransition} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', userSelect: 'none' }} />
        </motion.button>
        <motion.div key={'mood-' + animationVersion} initial={reduceMotion ? false : { scale: 0, rotate: -12, opacity: 0 }} animate={reduceMotion ? {} : { scale: [1, 1.14, 1], rotate: [0, 7, 0], opacity: 1 }} transition={reduceMotion ? {} : { duration: 0.34 }} aria-hidden="true" style={{ position: 'absolute', top: -1, right: -1, display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 18, background: mood === 'angry' ? '#F8E7E2' : '#C9F06A', color: '#1F5B4B', fontSize: 17, boxShadow: '0 3px 10px rgba(23,33,31,0.12)', pointerEvents: 'none' }}>{reaction.emoji}</motion.div>
      </div>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ color: '#1F5B4B', fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>MIKA · GAME BUDDY</div>
        <div aria-live="polite" style={{ color: mood === 'angry' ? '#B94E3D' : '#17211F', fontSize: 16, fontWeight: 900, letterSpacing: -0.3, lineHeight: 1.2 }}>{reaction.title}</div>
        <div style={{ color: '#65716B', fontSize: 12, lineHeight: 1.45 }}>{reaction.message}</div>
        <div style={{ color: mood === 'angry' ? '#B94E3D' : '#65716B', fontSize: 10, fontWeight: 800 }}>Sentuhan cepat: {Math.min(tapStreak, 4)}/4 {mood === 'angry' ? '· MODE KESAL' : '· jangan jahil ya!'}</div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
          <motion.button type="button" onClick={() => doAction('snack')} whileTap={reduceMotion ? {} : { scale: 0.94 }} style={{ border: 0, borderRadius: 999, padding: '7px 9px', background: '#E2E9DF', color: '#1F5B4B', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>🍪 Camilan</motion.button>
          <motion.button type="button" onClick={() => doAction('highfive')} whileTap={reduceMotion ? {} : { scale: 0.94 }} style={{ border: '1px solid #E1E4DC', borderRadius: 999, padding: '7px 9px', background: '#F7F5EF', color: '#1F5B4B', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>✋ Tos</motion.button>
          <motion.button type="button" onClick={showNextTip} whileTap={reduceMotion ? {} : { scale: 0.94 }} style={{ border: 0, borderRadius: 999, padding: '7px 9px', background: '#E2E9DF', color: '#1F5B4B', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Tips</motion.button>
          <motion.button type="button" onClick={onStartQuiz} whileTap={reduceMotion ? {} : { scale: 0.94 }} style={{ border: 0, borderRadius: 999, padding: '7px 9px', background: '#1F5B4B', color: '#FFFFFF', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Kuis</motion.button>
          <motion.button type="button" aria-label="Buka semua materi" onClick={onTapLessons} whileTap={reduceMotion ? {} : { scale: 0.94 }} style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, border: '1px solid #E1E4DC', borderRadius: 999, background: '#F7F5EF', color: '#1F5B4B', fontSize: 16, cursor: 'pointer' }}>→</motion.button>
        </div>
      </div>
    </div>
  );
}
