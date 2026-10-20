import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

/** Native version of Mika. React Native Animated keeps this compatible with Android and iOS. */
export default function MascotCoach({ completedCount, quizScore, onTapLessons, onStartQuiz }) {
  const [tipIndex, setTipIndex] = useState(0);
  const floating = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  // Keep the low-amplitude float loop alive while visible, then stop it on unmount.
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(floating, { toValue: 1, duration: 1250, useNativeDriver: true }),
      Animated.timing(floating, { toValue: 0, duration: 1250, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [floating]);

  // Context-aware coaching messages use the same wording as the web version.
  const tips = [
    { title: 'Hai, aku Mika! ✨', message: 'Tap aku kapan saja untuk mendapat dorongan semangat belajar.' },
    { title: 'Pelan-pelan asal paham.', message: completedCount > 0 ? `Kamu sudah menuntaskan ${completedCount} dari 4 modul. Teruskan, ya!` : 'Mulai dari satu modul dulu. Nggak perlu buru-buru.' },
    { title: 'Siap tantangan kecil?', message: quizScore === null ? 'Coba kuis singkat untuk melihat konsep yang sudah kamu kuasai.' : `Skor terakhir kamu ${quizScore}%. Yuk, review materi yang masih menantang!` },
  ];

  /** Rotate coaching copy and give a small spring response when Mika is tapped. */
  function showNextTip() {
    setTipIndex((current) => (current + 1) % tips.length);
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.06, useNativeDriver: true, speed: 22, bounciness: 8 }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 5 }),
    ]).start();
  }

  const translateY = floating.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel="Minta tips belajar dari Mika" onPress={showNextTip} style={styles.portraitPressable}>
        <Animated.View style={[styles.portraitFrame, { transform: [{ translateY }, { scale: pulse }] }]}>
          <Image source={require('../../assets/mika.jpg')} accessibilityLabel="Mika, karakter anime perempuan berambut panjang dengan jaket hijau" resizeMode="cover" style={styles.portrait} />
        </Animated.View>
        <View style={styles.sparkle}><Ionicons name="sparkles" size={13} color={colors.forest} /></View>
      </Pressable>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>MIKA · STUDY BUDDY</Text>
        <Text accessibilityLiveRegion="polite" style={styles.title}>{tips[tipIndex].title}</Text>
        <Text style={styles.message}>{tips[tipIndex].message}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={showNextTip} style={styles.chip}><Text style={styles.chipText}>Tips lagi</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={onStartQuiz} style={[styles.chip, styles.chipPrimary]}><Text style={[styles.chipText, styles.chipTextPrimary]}>Mulai kuis</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Buka semua materi" onPress={onTapLessons} style={styles.iconButton}><Ionicons name="arrow-forward" size={15} color={colors.forest} /></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, minHeight: 146, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  portraitPressable: { width: 91, minWidth: 91, height: 132, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  portraitFrame: { width: 88, height: 128, borderRadius: 15, overflow: 'hidden', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  portrait: { width: '100%', height: '100%' },
  sparkle: { position: 'absolute', top: 1, right: 0, width: 25, height: 25, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  message: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sage },
  chipText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  chipPrimary: { backgroundColor: colors.forest },
  chipTextPrimary: { color: colors.surface },
  iconButton: { width: 28, height: 28, borderRadius: radius.pill, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
