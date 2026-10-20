import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const calmReaction = { title: 'Hai, aku Mika! ✨', message: 'Sentuh aku untuk melihat reaksiku. Tapi jangan jahil berkali-kali, ya!', emoji: '💚' };

export default function MascotCoach({ completedCount, quizScore, onTapLessons, onStartQuiz }) {
  const [reaction, setReaction] = useState(calmReaction);
  const [mood, setMood] = useState('happy');
  const [tapStreak, setTapStreak] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const floating = useRef(new Animated.Value(0)).current;
  const jumpY = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const tapState = useRef({ count: 0, lastTap: 0 });
  const angerTimer = useRef(null);
  const tips = [
    { title: 'Tips fokus 🎯', message: 'Belajar 15 menit, istirahat sebentar, lalu jelaskan konsep dengan kata-katamu sendiri.' },
    { title: 'Ingat konsepnya 🧠', message: completedCount > 0 ? 'Kamu sudah menyelesaikan ' + completedCount + ' dari 4 modul. Teruskan, ya!' : 'Mulai dari satu modul dulu. Nggak perlu buru-buru.' },
    { title: 'Ayo latihan ⚡', message: quizScore === null ? 'Kerjakan kuis untuk mengetahui konsep yang perlu diulang.' : 'Skor terakhirmu ' + quizScore + '%. Yuk, pecahkan rekor itu!' },
  ];

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(floating, { toValue: 1, duration: 1250, useNativeDriver: true }),
      Animated.timing(floating, { toValue: 0, duration: 1250, useNativeDriver: true }),
    ]));
    loop.start();
    return () => { loop.stop(); if (angerTimer.current) clearTimeout(angerTimer.current); };
  }, [floating]);

  function reactAs(nextMood, title, message, emoji) {
    setMood(nextMood);
    setReaction({ title, message, emoji });
    jumpY.stopAnimation();
    shakeX.stopAnimation();
    if (nextMood === 'angry') {
      jumpY.setValue(0);
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -8, duration: 48, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 8, duration: 48, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -7, duration: 48, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 7, duration: 48, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 65, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 90, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]).start();
    } else {
      shakeX.setValue(0);
      jumpY.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.spring(jumpY, { toValue: -17, useNativeDriver: true, speed: 22, bounciness: 12 }),
          Animated.sequence([
            Animated.spring(pulse, { toValue: 1.08, useNativeDriver: true, speed: 20, bounciness: 10 }),
            Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
          ]),
        ]),
        Animated.spring(jumpY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }),
      ]).start();
    }
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

  const floatY = floating.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const composedY = Animated.add(floatY, jumpY);

  return (
    <View style={styles.card} accessibilityLabel="Mika, karakter interaktif KULIAH LAB">
      <Pressable accessibilityRole="button" accessibilityLabel="Sentuh Mika untuk melihat reaksinya" onPress={onCharacterTap} style={styles.portraitPressable}>
        <Animated.View style={[styles.portraitFrame, { transform: [{ translateX: shakeX }, { translateY: composedY }, { scale: pulse }] }, mood === 'angry' && styles.portraitFrameAngry]}>
          <Image source={{ uri: 'https://gcdn.picsart.com/pipeline-output/ecfeab13-e1a4-4a84-aec2-e81c25ffcdfe.png' }} accessibilityLabel="Mika, karakter anime perempuan berambut cokelat panjang memakai hoodie hijau" resizeMode="cover" style={styles.portrait} />
        </Animated.View>
        <View style={[styles.moodBubble, mood === 'angry' && styles.moodBubbleAngry]}><Text style={styles.moodEmoji}>{reaction.emoji}</Text></View>
      </Pressable>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>MIKA · GAME BUDDY</Text>
        <Text accessibilityLiveRegion="polite" style={[styles.title, mood === 'angry' && styles.titleAngry]}>{reaction.title}</Text>
        <Text style={styles.message}>{reaction.message}</Text>
        <Text style={[styles.streakText, mood === 'angry' && styles.streakTextAngry]}>Sentuhan cepat: {Math.min(tapStreak, 4)}/4 {mood === 'angry' ? '· MODE KESAL' : '· jangan jahil ya!'}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => doAction('snack')} style={styles.chip}><Text style={styles.chipText}>🍪 Camilan</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => doAction('highfive')} style={styles.chip}><Text style={styles.chipText}>✋ Tos</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={showNextTip} style={styles.chip}><Text style={styles.chipText}>Tips</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={onStartQuiz} style={[styles.chip, styles.chipPrimary]}><Text style={[styles.chipText, styles.chipTextPrimary]}>Kuis</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Buka semua materi" onPress={onTapLessons} style={styles.iconButton}><Ionicons name="arrow-forward" size={15} color={colors.forest} /></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, minHeight: 184, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  portraitPressable: { width: 110, minWidth: 110, minHeight: 162, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  portraitFrame: { width: 102, height: 150, borderRadius: 17, overflow: 'hidden', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  portraitFrameAngry: { borderColor: colors.coral },
  portrait: { width: '100%', height: '100%' },
  moodBubble: { position: 'absolute', top: -1, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  moodBubbleAngry: { backgroundColor: colors.coralSoft },
  moodEmoji: { fontSize: 17 },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 15, lineHeight: 19, fontWeight: '900', letterSpacing: -0.2 },
  titleAngry: { color: colors.coral },
  message: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  streakText: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  streakTextAngry: { color: colors.coral },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sage },
  chipText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  chipPrimary: { backgroundColor: colors.forest },
  chipTextPrimary: { color: colors.surface },
  iconButton: { width: 28, height: 28, borderRadius: radius.pill, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
