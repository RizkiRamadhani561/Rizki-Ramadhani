import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from './src/theme';
import { lessons } from './src/data/lessons';
import { questionBank } from './src/data/quizBank';

// Kunci berversi agar struktur penyimpanan dapat dimigrasikan kemudian.
const STORAGE_KEY = '@kuliah-lab/progress-v2';
const QUESTIONS_PER_QUIZ = 10;

/** Mengacak salinan array dengan Fisher-Yates tanpa mengubah bank asli. */
function shuffleQuestions(source) {
  const shuffled = [...source];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

/**
 * KULIAH LAB — aplikasi belajar Mobile Programming.
 *
 * File ini sengaja menggabungkan layar MVP dalam satu file agar mudah dipelajari
 * pemula. Data materi dan design tokens sudah dipisah ke src/data dan src/theme.
 * Setiap fungsi UI menerima props eksplisit agar contoh props dapat dipelajari.
 */

/** Membuat ikon konsisten dengan ukuran dan warna yang ditentukan oleh pemanggil. */
function AppIcon({ name, size = 20, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

/** Tombol utama yang bisa digunakan ulang di berbagai layar. */
function PrimaryButton({ label, onPress, icon, disabled = false, variant = 'solid' }) {
  const isOutline = variant === 'outline';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        isOutline && styles.outlineButton,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.primaryButtonText, isOutline && styles.outlineButtonText]}>
        {label}
      </Text>
      {icon ? (
        <AppIcon
          name={icon}
          size={18}
          color={isOutline ? colors.forest : colors.surface}
        />
      ) : null}
    </Pressable>
  );
}

/** Menampilkan label kecil berbentuk chip untuk kategori dan status. */
function Eyebrow({ children, tone = 'default' }) {
  const isGreen = tone === 'green';
  const isLime = tone === 'lime';
  return (
    <View style={[styles.eyebrow, isGreen && styles.eyebrowGreen, isLime && styles.eyebrowLime]}>
      <Text style={[styles.eyebrowText, isGreen && styles.eyebrowGreenText, isLime && styles.eyebrowLimeText]}>
        {children}
      </Text>
    </View>
  );
}

/** Bar progres dengan label angka agar informasi tidak bergantung pada warna saja. */
function ProgressBar({ value, light = false }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: safeValue }}
      style={[styles.progressTrack, light && styles.progressTrackLight]}
    >
      <View style={[styles.progressFill, { width: safeValue + '%' }, light && styles.progressFillLight]} />
    </View>
  );
}

/** Kartu materi menampilkan informasi penting dan memanggil callback saat ditekan. */
function LessonCard({ lesson, completed, onPress, compact = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'Buka materi ' + lesson.title}
      onPress={onPress}
      style={({ pressed }) => [styles.lessonCard, compact && styles.lessonCardCompact, pressed && styles.cardPressed]}
    >
      <View style={[styles.lessonIconWrap, { backgroundColor: lesson.color }]}>
        <AppIcon name={lesson.icon} size={22} color={colors.ink} />
      </View>
      <View style={styles.lessonCopy}>
        <View style={styles.lessonMetaRow}>
          <Text style={styles.lessonNumber}>MODUL {lesson.number}</Text>
          <Text style={styles.dotSeparator}>·</Text>
          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
        </View>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {!compact ? <Text style={styles.lessonSubtitle} numberOfLines={2}>{lesson.subtitle}</Text> : null}
        <View style={styles.lessonStatusRow}>
          <View style={[styles.statusDot, completed && styles.statusDotComplete]} />
          <Text style={[styles.lessonStatus, completed && styles.lessonStatusComplete]}>
            {completed ? 'Selesai dipelajari' : 'Belum selesai'}
          </Text>
        </View>
      </View>
      <AppIcon name={completed ? 'checkmark-circle' : 'chevron-forward'} size={20} color={completed ? colors.forest : colors.muted} />
    </Pressable>
  );
}

/** Header halaman berisi judul dan sapaan, tanpa mengambil terlalu banyak ruang. */
function PageHeader({ eyebrow, title, subtitle, trailing }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderText}>
        {eyebrow ? <Text style={styles.pageEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing || null}
    </View>
  );
}

/** Kartu statistik kecil untuk menyajikan satu metrik dengan label yang jelas. */
function StatCard({ icon, value, label, tint = colors.sage }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <AppIcon name={icon} size={18} color={colors.forest} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Ilustrasi Mika dibuat sebagai SVG agar tajam di web dan layar ponsel. */
function MikaIllustration() {
  return (
    <Svg viewBox="0 0 160 215" width="100%" height="100%" accessibilityLabel="Mika, karakter anime perempuan dengan jaket hijau">
      <Rect width="160" height="215" rx="15" fill="#E2E9DF" />
      <Circle cx="130" cy="26" r="15" fill="#C9F06A" opacity="0.7" />
      <Circle cx="20" cy="52" r="4" fill="#FFFFFF" />
      <Path d="M43 82 C31 45 49 13 83 11 C117 9 137 31 135 75 L142 149 C142 177 128 199 116 215 L43 215 C34 183 33 150 38 123 Z" fill="#17211F" />
      <Path d="M19 215 L25 167 C28 146 44 138 62 132 L103 132 C123 137 139 151 144 176 L150 215 Z" fill="#1F5B4B" />
      <Path d="M25 168 C35 157 48 158 57 174 L67 215 L36 215 Z" fill="#164638" />
      <Path d="M122 160 C132 154 141 166 145 184 L151 215 L123 215 L113 179 Z" fill="#164638" />
      <Path d="M65 115 L65 143 C71 154 93 154 100 141 L97 112 Z" fill="#EAB49B" />
      <Ellipse cx="45" cy="91" rx="8" ry="13" fill="#F1C4AA" />
      <Ellipse cx="119" cy="91" rx="8" ry="13" fill="#F1C4AA" />
      <Path d="M48 57 C49 34 64 25 83 26 C106 25 118 42 117 66 L113 99 C109 119 96 132 82 132 C66 131 53 117 50 98 Z" fill="#F7CFB8" />
      <Path d="M47 67 C43 43 57 20 82 19 C109 17 124 39 119 69 L111 61 L105 43 C94 52 79 54 65 50 L53 76 Z" fill="#17211F" />
      <Path d="M49 58 C51 40 65 28 81 28 C91 27 102 32 108 42 C91 49 76 48 65 44 C61 56 55 65 49 70 Z" fill="#263A33" />
      <Path d="M49 66 C58 54 65 44 65 33 C74 47 89 49 105 41 C111 48 116 57 117 66 L108 59 L103 52 C88 59 68 58 57 72 Z" fill="#17211F" />
      <Path d="M56 78 C62 71 72 71 78 78" stroke="#17211F" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M88 78 C95 71 105 72 110 79" stroke="#17211F" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Ellipse cx="67" cy="87" rx="10" ry="13" fill="#FFFFFF" />
      <Ellipse cx="99" cy="87" rx="10" ry="13" fill="#FFFFFF" />
      <Ellipse cx="68" cy="88" rx="7" ry="10" fill="#5C8D62" />
      <Ellipse cx="99" cy="88" rx="7" ry="10" fill="#5C8D62" />
      <Ellipse cx="68" cy="90" rx="4" ry="7" fill="#17211F" />
      <Ellipse cx="99" cy="90" rx="4" ry="7" fill="#17211F" />
      <Circle cx="65" cy="83" r="3" fill="#FFFFFF" />
      <Circle cx="96" cy="83" r="3" fill="#FFFFFF" />
      <Circle cx="71" cy="94" r="1.7" fill="#FFFFFF" />
      <Circle cx="102" cy="94" r="1.7" fill="#FFFFFF" />
      <Path d="M80 97 L78 102 L82 103" stroke="#D79A84" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Path d="M72 111 C78 118 88 118 94 109 C88 113 79 114 72 111 Z" fill="#A8444D" />
      <Path d="M72 111 C79 113 87 112 93 109" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M48 80 C46 61 53 47 63 36 C59 56 55 70 48 80 Z" fill="#17211F" />
      <Path d="M104 44 C117 54 120 68 118 82 C114 73 109 63 104 44 Z" fill="#17211F" />
      <Path d="M111 48 L120 38 L116 52 L125 46" stroke="#C9F06A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <Path d="M57 142 L81 160 L105 141 L99 133 C91 145 73 145 64 133 Z" fill="#F7F5EF" />
      <Path d="M81 160 L81 201" stroke="#B8C9BD" strokeWidth="2.5" />
      <Path d="M50 174 L71 167 L83 179 L62 198 Z" fill="#F7F5EF" stroke="#164638" strokeWidth="2" />
      <Path d="M56 180 L70 175" stroke="#C9F06A" strokeWidth="2" strokeLinecap="round" />
      <Path d="M122 127 L129 119 L128 130 L136 126" stroke="#C9F06A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="28" cy="32" r="3" fill="#1F5B4B" />
      <Path d="M20 39 L24 35 L28 39 L24 43 Z" fill="#C9F06A" />
    </Svg>
  );
}

/** Maskot Mika mengambang, merespons sentuhan, dan memberi tips belajar. */
function MascotCoach({ completedCount, quizScore, onTapLessons, onStartQuiz }) {
  const [tipIndex, setTipIndex] = useState(0);
  const floating = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  // React Native Web does not provide the native animation driver.
  const useNativeDriver = Platform.OS !== 'web';

  // Loop berhenti saat komponen dilepas agar animasi tidak berjalan di belakang layar.
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(floating, { toValue: 1, duration: 1250, useNativeDriver }),
      Animated.timing(floating, { toValue: 0, duration: 1250, useNativeDriver }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [floating]);

  // Pesan mengikuti progres dan skor terakhir agar maskot terasa personal.
  const tips = [
    { title: 'Hai, aku Mika! ✨', message: 'Tap aku kapan saja untuk mendapat dorongan semangat belajar.' },
    { title: 'Pelan-pelan asal paham.', message: completedCount > 0 ? `Kamu sudah menuntaskan ${completedCount} dari ${lessons.length} modul. Teruskan, ya!` : 'Mulai dari satu modul dulu. Nggak perlu buru-buru.' },
    { title: 'Siap tantangan kecil?', message: quizScore === null ? 'Coba kuis singkat untuk melihat konsep yang sudah kamu kuasai.' : `Skor terakhir kamu ${quizScore}%. Yuk, review materi yang masih menantang!` },
  ];

  /** Berpindah tips dan memberi respons pulse saat pengguna menyentuh karakter. */
  function showNextTip() {
    setTipIndex((current) => (current + 1) % tips.length);
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.07, useNativeDriver, speed: 22, bounciness: 8 }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver, speed: 18, bounciness: 5 }),
    ]).start();
  }

  const translateY = floating.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  return (
    <View style={styles.mascotCard}>
      <Pressable accessibilityRole="button" accessibilityLabel="Minta tips belajar dari Mika" onPress={showNextTip} style={styles.mascotPortraitPressable}>
        <Animated.View style={[styles.mascotPortrait, { transform: [{ translateY }, { scale: pulse }] }]}>
          <MikaIllustration />
        </Animated.View>
        <View style={styles.mascotSparkle}><AppIcon name="sparkles" size={13} color={colors.forest} /></View>
      </Pressable>
      <View style={styles.mascotContent}>
        <Text style={styles.mascotEyebrow}>MIKA · STUDY BUDDY</Text>
        <Text style={styles.mascotTitle}>{tips[tipIndex].title}</Text>
        <Text style={styles.mascotMessage}>{tips[tipIndex].message}</Text>
        <View style={styles.mascotActions}>
          <Pressable accessibilityRole="button" onPress={showNextTip} style={styles.mascotChip}><Text style={styles.mascotChipText}>Tips lagi</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={onStartQuiz} style={[styles.mascotChip, styles.mascotChipPrimary]}><Text style={[styles.mascotChipText, styles.mascotChipTextPrimary]}>Mulai kuis</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Buka semua materi" onPress={onTapLessons} style={styles.mascotIconButton}><AppIcon name="arrow-forward" size={15} color={colors.forest} /></Pressable>
        </View>
      </View>
    </View>
  );
}

/** Beranda berisi CTA utama dan materi yang disarankan untuk dilanjutkan. */
function HomeScreen({ completedCount, completedIds, quizScore, onOpenLesson, onStartQuiz, onSeeLessons }) {
  const continueLesson = lessons.find((item) => item.id === 'state-props') || lessons[0];

  return (
    <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.greeting}>SELAMAT BELAJAR,</Text>
          <Text style={styles.welcomeName}>Calon mobile dev.</Text>
        </View>
        <View style={styles.avatarMark}>
          <AppIcon name="school-outline" size={25} color={colors.forest} />
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopline}>
          <Eyebrow tone="lime">UTS MODE</Eyebrow>
          <Text style={styles.heroTiny}>MOBILE PROGRAMMING / 01</Text>
        </View>
        <Text style={styles.heroTitle}>Paham konsepnya.{ '\n' }Lolos ujiannya.</Text>
        <Text style={styles.heroBody}>
          Belajar React Native dari komponen sampai layout, satu konsep dalam satu waktu.
        </Text>
        <View style={styles.heroProgressHeader}>
          <Text style={styles.heroProgressLabel}>Progres materi</Text>
          <Text style={styles.heroProgressValue}>{completedCount}/{lessons.length} selesai</Text>
        </View>
        <ProgressBar value={(completedCount / lessons.length) * 100} light />
        <PrimaryButton label="Lanjut belajar" icon="arrow-up-right" onPress={() => onOpenLesson(continueLesson)} />
        <View style={styles.heroDecorOne} />
        <View style={styles.heroDecorTwo} />
      </View>

      <MascotCoach completedCount={completedCount} quizScore={quizScore} onTapLessons={onSeeLessons} onStartQuiz={onStartQuiz} />

      <View style={styles.statsRow}>
        <StatCard icon="book-outline" value={String(lessons.length)} label="Modul ringkas" />
        <StatCard icon="checkmark-done-outline" value={String(completedCount)} label="Sudah selesai" tint="#F8EED8" />
        <StatCard icon="ribbon-outline" value={quizScore === null ? '—' : quizScore + '%'} label="Skor terakhir" tint="#E7E7F7" />
      </View>

      <View style={styles.sectionHeadingRow}>
        <View>
          <Text style={styles.sectionTitle}>Rute belajar lu</Text>
          <Text style={styles.sectionCaption}>Mulai dari dasar, lalu uji pemahaman.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onSeeLessons} style={styles.textLink}>
          <Text style={styles.textLinkLabel}>Semua materi</Text>
          <AppIcon name="arrow-forward" size={15} color={colors.forest} />
        </Pressable>
      </View>

      <View style={styles.lessonList}>
        {lessons.slice(0, 2).map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            completed={completedIds.includes(lesson.id)}
            onPress={() => onOpenLesson(lesson)}
          />
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={onStartQuiz} style={({ pressed }) => [styles.quizPromo, pressed && styles.cardPressed]}>
        <View style={styles.quizPromoIcon}>
          <AppIcon name="flash-outline" size={23} color={colors.ink} />
        </View>
        <View style={styles.quizPromoCopy}>
          <Text style={styles.quizPromoTitle}>Tes pemahaman lu</Text>
          <Text style={styles.quizPromoText}>10 soal pilihan ganda + pembahasan.</Text>
        </View>
        <AppIcon name="arrow-up-right" size={21} color={colors.ink} />
      </Pressable>
      <Text style={styles.disclaimer}>Latihan ini disusun berdasarkan kisi-kisi belajar, bukan bocoran soal resmi.</Text>
    </ScrollView>
  );
}

/** Layar katalog materi. Pencarian dilakukan lokal agar tidak memerlukan API. */
function LessonsScreen({ completedIds, onOpenLesson }) {
  const [search, setSearch] = useState('');
  const filteredLessons = lessons.filter((lesson) => {
    const query = search.trim().toLowerCase();
    return !query || (lesson.title + ' ' + lesson.subtitle + ' ' + lesson.category).toLowerCase().includes(query);
  });

  return (
    <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="LIBRARY / 04 MODUL" title="Materi belajar" subtitle="Konsep inti yang paling relevan dengan kisi-kisi UTS lu." />
      <View style={styles.searchBox}>
        <AppIcon name="search-outline" size={19} color={colors.muted} />
        <TextInput
          accessibilityLabel="Cari materi"
          placeholder="Cari component, state, layout..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Hapus pencarian" onPress={() => setSearch('')}>
            <AppIcon name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.listSummary}>
        <Text style={styles.listSummaryLabel}>{filteredLessons.length} modul ditemukan</Text>
        <Text style={styles.listSummaryRight}>{completedIds.length} selesai</Text>
      </View>
      {filteredLessons.length ? (
        <View style={styles.lessonList}>
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} completed={completedIds.includes(lesson.id)} onPress={() => onOpenLesson(lesson)} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <AppIcon name="search-outline" size={30} color={colors.muted} />
          <Text style={styles.emptyTitle}>Materi belum ditemukan</Text>
          <Text style={styles.emptyText}>Coba kata kunci lain, misalnya “state” atau “layout”.</Text>
        </View>
      )}
    </ScrollView>
  );
}

/** Detail pelajaran mengajarkan konsep, poin kunci, kode, dan takeaway. */
function LessonDetailScreen({ lesson, completed, onBack, onComplete }) {
  if (!lesson) return null;

  return (
    <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backLink}>
        <AppIcon name="arrow-back" size={18} color={colors.forest} />
        <Text style={styles.backLinkText}>Kembali ke materi</Text>
      </Pressable>

      <View style={[styles.detailIconLarge, { backgroundColor: lesson.color }]}>
        <AppIcon name={lesson.icon} size={28} color={colors.ink} />
      </View>
      <Eyebrow tone="green">{lesson.category}</Eyebrow>
      <Text style={styles.detailTitle}>{lesson.title}</Text>
      <Text style={styles.detailSubtitle}>{lesson.subtitle}</Text>
      <View style={styles.detailMetaRow}>
        <AppIcon name="time-outline" size={16} color={colors.muted} />
        <Text style={styles.detailMetaText}>{lesson.duration} baca</Text>
        <View style={styles.metaDivider} />
        <AppIcon name="document-text-outline" size={16} color={colors.muted} />
        <Text style={styles.detailMetaText}>{lesson.keyPoints.length} poin penting</Text>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.contentLabel}>INTI MATERI</Text>
        <Text style={styles.bodyCopy}>{lesson.summary}</Text>
      </View>

      <Text style={styles.sectionTitle}>Yang perlu lu ingat</Text>
      <View style={styles.keyPointsList}>
        {lesson.keyPoints.map((point, index) => (
          <View key={point.term} style={styles.keyPointRow}>
            <View style={styles.keyPointNumber}>
              <Text style={styles.keyPointNumberText}>{String(index + 1).padStart(2, '0')}</Text>
            </View>
            <View style={styles.keyPointCopy}>
              <Text style={styles.keyPointTitle}>{point.term}</Text>
              <Text style={styles.keyPointDetail}>{point.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.codePanel}>
        <View style={styles.codePanelHeader}>
          <View style={styles.codeDots}>
            <View style={[styles.codeDot, { backgroundColor: '#E68173' }]} />
            <View style={[styles.codeDot, { backgroundColor: '#E8C36A' }]} />
            <View style={[styles.codeDot, { backgroundColor: '#7EC6A0' }]} />
          </View>
          <Text style={styles.codeFileLabel}>CONTOH KODE</Text>
          <AppIcon name="code-slash-outline" size={17} color="#B7C9C0" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text selectable style={styles.codeText}>{lesson.code}</Text>
        </ScrollView>
      </View>

      <View style={styles.takeawayCard}>
        <View style={styles.takeawayIcon}>
          <AppIcon name="bulb-outline" size={20} color={colors.forest} />
        </View>
        <View style={styles.takeawayCopy}>
          <Text style={styles.takeawayTitle}>Ingat buat UTS</Text>
          <Text style={styles.takeawayText}>{lesson.takeaway}</Text>
        </View>
      </View>

      <PrimaryButton
        label={completed ? 'Materi sudah selesai' : 'Tandai materi selesai'}
        icon={completed ? 'checkmark-circle-outline' : 'checkmark'}
        onPress={() => onComplete(lesson.id)}
        variant={completed ? 'outline' : 'solid'}
      />
      <View style={styles.bottomBreathingRoom} />
    </ScrollView>
  );
}

/** Kuis dengan pilihan jawaban, feedback, pembahasan, dan hasil akhir. */
function QuizScreen({
  questions,
  attempt,
  onReviewAttempt,
  questionIndex,
  selectedAnswer,
  answers,
  feedbackVisible,
  quizFinished,
  score,
  onSelectAnswer,
  onCheckAnswer,
  onNextQuestion,
  onRestart,
}) {
  if (quizFinished) {
    const correctCount = attempt?.correctCount ?? Math.round((score / 100) * questions.length);
    const missedItems = attempt?.items?.filter((item) => !item.isCorrect) ?? [];
    return (
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resultHero}>
          <View style={styles.resultIcon}>
            <AppIcon name={score >= 70 ? 'trophy-outline' : 'book-outline'} size={34} color={colors.forest} />
          </View>
          <Eyebrow tone="green">SESI SELESAI</Eyebrow>
          <Text style={styles.resultTitle}>{score >= 80 ? 'Mantap, gas terus!' : score >= 60 ? 'Progres yang bagus.' : 'Saatnya review lagi.'}</Text>
          <Text style={styles.resultSubtitle}>Kamu menjawab {correctCount} dari {questions.length} soal dengan benar.</Text>
          <Text style={styles.resultScore}>{score}<Text style={styles.resultPercent}>%</Text></Text>
          <ProgressBar value={score} />
          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{correctCount}</Text>
              <Text style={styles.resultStatLabel}>Jawaban benar</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{questions.length - correctCount}</Text>
              <Text style={styles.resultStatLabel}>Perlu diulang</Text>
            </View>
          </View>
        </View>
        <View style={styles.contentCard}>
          <Text style={styles.contentLabel}>REKOMENDASI BERIKUTNYA</Text>
          <Text style={styles.bodyCopy}>Buka kembali materi yang masih terasa sulit, lalu ulangi kuis untuk menguji pemahaman. Fokus pada alasan di balik jawaban, bukan sekadar menghafal.</Text>
        </View>
        {missedItems.length > 0 ? (
          <View style={styles.contentCard}>
            <Text style={styles.contentLabel}>YANG PERLU DIREVIEW</Text>
            <Text style={styles.bodyCopy}>{missedItems.length} soal belum tepat. Lihat jawabanmu, jawaban benar, dan materi terkait agar konsepnya makin kuat.</Text>
            <PrimaryButton label="Review jawaban salah" icon="book-open-outline" onPress={() => onReviewAttempt(attempt)} variant="outline" />
          </View>
        ) : (
          <View style={styles.takeawayCard}>
            <AppIcon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.takeawayText}>Sempurna! Semua jawaban benar. Pertahankan, ya.</Text>
          </View>
        )}
        <PrimaryButton label="Ulangi kuis" icon="refresh" onPress={onRestart} />
      </ScrollView>
    );
  }

  const question = questions[questionIndex];
  const selectedIsCorrect = selectedAnswer === question.answer;

  return (
    <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="PRACTICE / UTS" title="Uji pemahaman" subtitle="Pilih jawaban terbaik, lalu baca pembahasannya." />
      <View style={styles.quizProgressHeader}>
        <Text style={styles.quizQuestionCount}>SOAL {String(questionIndex + 1).padStart(2, '0')} <Text style={styles.quizQuestionOf}>/ {String(questions.length).padStart(2, '0')}</Text></Text>
        <Text style={styles.quizTopic}>{question.topic}</Text>
      </View>
      <ProgressBar value={((questionIndex + 1) / questions.length) * 100} />
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>
      <View style={styles.answerList}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = feedbackVisible && index === question.answer;
          const isWrongSelected = feedbackVisible && isSelected && !selectedIsCorrect;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: feedbackVisible }}
              onPress={() => onSelectAnswer(index)}
              disabled={feedbackVisible}
              style={({ pressed }) => [
                styles.answerOption,
                isSelected && styles.answerOptionSelected,
                isCorrect && styles.answerOptionCorrect,
                isWrongSelected && styles.answerOptionWrong,
                pressed && !feedbackVisible && styles.cardPressed,
              ]}
            >
              <View style={[styles.answerLetter, isSelected && styles.answerLetterSelected, isCorrect && styles.answerLetterCorrect, isWrongSelected && styles.answerLetterWrong]}>
                <Text style={[styles.answerLetterText, (isSelected || isCorrect || isWrongSelected) && styles.answerLetterTextActive]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={styles.answerText}>{option}</Text>
              {isCorrect ? <AppIcon name="checkmark-circle" size={21} color={colors.success} /> : null}
              {isWrongSelected ? <AppIcon name="close-circle" size={21} color={colors.coral} /> : null}
            </Pressable>
          );
        })}
      </View>

      {feedbackVisible ? (
        <View style={[styles.feedbackCard, selectedIsCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <View style={styles.feedbackHeading}>
            <AppIcon name={selectedIsCorrect ? 'checkmark-circle' : 'information-circle'} size={20} color={selectedIsCorrect ? colors.success : colors.coral} />
            <Text style={[styles.feedbackTitle, { color: selectedIsCorrect ? colors.success : colors.coral }]}>
              {selectedIsCorrect ? 'Betul! Good job.' : 'Belum tepat, cek lagi.'}
            </Text>
          </View>
          <Text style={styles.feedbackText}>{question.explanation}</Text>
        </View>
      ) : null}

      {!feedbackVisible ? (
        <PrimaryButton label="Periksa jawaban" icon="arrow-forward" onPress={onCheckAnswer} disabled={selectedAnswer === null} />
      ) : (
        <PrimaryButton label={questionIndex === questions.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'} icon="arrow-forward" onPress={onNextQuestion} />
      )}
      <Text style={styles.quizFootnote}>Soal diacak dari bank latihan. Hasil dan riwayat tersimpan di perangkat ini.</Text>
    </ScrollView>
  );
}

/** Ringkasan progres dari materi yang ditandai selesai dan skor kuis terakhir. */
function ProgressScreen({ completedIds, quizScore, quizHistory, onOpenLesson, onStartQuiz, onReviewAttempt }) {
  const percent = Math.round((completedIds.length / lessons.length) * 100);
  const nextLesson = lessons.find((lesson) => !completedIds.includes(lesson.id)) || lessons[0];

  return (
    <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="YOUR STUDY LOG" title="Progres belajar" subtitle="Lihat apa yang sudah dikuasai dan apa yang perlu diulang." />
      <View style={styles.progressOverview}>
        <View style={styles.progressOverviewTop}>
          <View>
            <Text style={styles.progressOverviewLabel}>MATERI DIKUASAI</Text>
            <Text style={styles.progressOverviewTitle}>{completedIds.length} dari {lessons.length} modul</Text>
          </View>
          <Text style={styles.progressOverviewPercent}>{percent}%</Text>
        </View>
        <ProgressBar value={percent} />
        <Text style={styles.progressOverviewNote}>{percent === 100 ? 'Semua modul sudah ditandai selesai. Saatnya latihan lagi!' : 'Sedikit demi sedikit. Konsisten lebih penting daripada buru-buru.'}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="checkmark-done-outline" value={String(completedIds.length)} label="Modul selesai" />
        <StatCard icon="ribbon-outline" value={quizScore === null ? '—' : quizScore + '%'} label="Skor terakhir" tint="#F8EED8" />
      </View>

      <View style={styles.sectionHeadingRow}>
        <View>
          <Text style={styles.sectionTitle}>Checklist materi</Text>
          <Text style={styles.sectionCaption}>Buka topik untuk review atau tandai selesai.</Text>
        </View>
      </View>
      <View style={styles.lessonList}>
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} completed={completedIds.includes(lesson.id)} onPress={() => onOpenLesson(lesson)} compact />
        ))}
      </View>

      <View style={styles.sectionHeadingRow}>
        <View>
          <Text style={styles.sectionTitle}>Riwayat kuis</Text>
          <Text style={styles.sectionCaption}>Skor latihan tersimpan di perangkat ini.</Text>
        </View>
      </View>
      {quizHistory.length ? (
        <View style={styles.historyList}>
          {quizHistory.slice(0, 8).map((attempt) => (
            <View key={attempt.id} style={styles.historyCard}>
              <View style={styles.historyScoreMark}><Text style={styles.historyScoreMarkText}>{attempt.score}%</Text></View>
              <View style={styles.historyCardCopy}>
                <Text style={styles.historyCardTitle}>{attempt.correctCount}/{attempt.total} jawaban benar</Text>
                <Text style={styles.historyCardMeta}>{new Date(attempt.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => onReviewAttempt(attempt)} style={styles.historyReviewButton}>
                <Text style={styles.historyReviewText}>Review</Text><AppIcon name="chevron-forward" size={15} color={colors.forest} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <AppIcon name="time-outline" size={28} color={colors.muted} />
          <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
          <Text style={styles.emptyText}>Kerjakan kuis pertamamu untuk menyimpan skor dan pembahasan di sini.</Text>
        </View>
      )}

      <View style={styles.nextStepCard}>
        <Eyebrow tone="green">LANGKAH SELANJUTNYA</Eyebrow>
        <Text style={styles.nextStepTitle}>{completedIds.length === lessons.length ? 'Uji pemahaman sekali lagi' : 'Lanjutkan: ' + nextLesson.title}</Text>
        <Text style={styles.nextStepBody}>{completedIds.length === lessons.length ? 'Pengulangan membantu konsep menempel lebih lama.' : 'Selesaikan modul berikutnya sebelum mencoba latihan akhir.'}</Text>
        <PrimaryButton
          label={completedIds.length === lessons.length ? 'Mulai kuis' : 'Buka materi'}
          icon="arrow-up-right"
          onPress={() => completedIds.length === lessons.length ? onStartQuiz() : onOpenLesson(nextLesson)}
        />
      </View>
    </ScrollView>
  );
}

/** Review fokus pada soal salah, pembahasan, dan pintasan ke materi terkait. */
function ReviewScreen({ reviewAttempt, onBack, onOpenLesson }) {
  if (!reviewAttempt) return null;
  const missedItems = reviewAttempt.items.filter((item) => !item.isCorrect);

  return (
    <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backLink}>
        <AppIcon name="arrow-back" size={18} color={colors.forest} />
        <Text style={styles.backLinkText}>Kembali ke hasil/progres</Text>
      </Pressable>
      <PageHeader eyebrow="REVIEW / PEMBAHASAN" title="Kita pelajari lagi." subtitle={`Skor ${reviewAttempt.score}% · ${missedItems.length} soal perlu ditinjau.`} />
      {missedItems.length === 0 ? (
        <View style={styles.takeawayCard}>
          <AppIcon name="checkmark-circle" size={22} color={colors.success} />
          <Text style={styles.takeawayText}>Tidak ada jawaban salah pada sesi ini. Keren!</Text>
        </View>
      ) : missedItems.map((item, index) => {
        const lesson = lessons.find((candidate) => candidate.id === item.lessonId);
        return (
          <View key={item.id} style={styles.reviewQuestionCard}>
            <View style={styles.reviewMetaRow}>
              <Eyebrow tone="green">{item.topic}</Eyebrow>
              <Text style={styles.reviewNumber}>REVIEW {String(index + 1).padStart(2, '0')}</Text>
            </View>
            <Text style={styles.reviewQuestion}>{item.question}</Text>
            <View style={[styles.reviewAnswerBox, styles.reviewAnswerWrong]}>
              <Text style={styles.reviewAnswerLabel}>JAWABAN KAMU</Text>
              <Text style={styles.reviewAnswerText}>{item.selectedAnswer === null ? 'Belum dijawab' : item.options[item.selectedAnswer]}</Text>
            </View>
            <View style={[styles.reviewAnswerBox, styles.reviewAnswerCorrect]}>
              <Text style={styles.reviewAnswerLabel}>JAWABAN YANG BENAR</Text>
              <Text style={styles.reviewAnswerText}>{item.options[item.answer]}</Text>
            </View>
            <View style={styles.reviewExplanation}>
              <Text style={styles.contentLabel}>PEMBAHASAN</Text>
              <Text style={styles.bodyCopy}>{item.explanation}</Text>
            </View>
            {lesson ? <PrimaryButton label={'Buka materi: ' + lesson.title} icon="book-outline" variant="outline" onPress={() => onOpenLesson(lesson)} /> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

/** Navigasi bawah yang selalu menampilkan ikon dan label untuk empat tujuan utama. */
function BottomNavigation({ activeTab, onChange }) {
  const tabs = [
    { id: 'home', label: 'Beranda', icon: 'home-outline', activeIcon: 'home' },
    { id: 'lessons', label: 'Materi', icon: 'book-outline', activeIcon: 'book' },
    { id: 'quiz', label: 'Kuis', icon: 'flash-outline', activeIcon: 'flash' },
    { id: 'progress', label: 'Progres', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.id)}
            style={styles.navItem}
          >
            <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
              <AppIcon name={active ? tab.activeIcon : tab.icon} size={20} color={active ? colors.surface : colors.muted} />
            </View>
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Root component: mengelola state aplikasi dan menentukan layar yang sedang aktif. */
export default function App() {
  // Tab aktif menentukan layar utama yang sedang ditampilkan.
  const [activeTab, setActiveTab] = useState('home');
  // selectedLesson menyimpan materi yang sedang dibaca; null berarti tidak ada detail terbuka.
  const [selectedLesson, setSelectedLesson] = useState(null);
  // Progres dan riwayat kuis di-hydrate dari penyimpanan lokal ketika aplikasi dibuka.
  const [completedIds, setCompletedIds] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [selectedReviewAttempt, setSelectedReviewAttempt] = useState(null);

  // Setiap sesi berisi sepuluh soal berbeda yang diacak dari bank soal.
  const [quizSessionQuestions, setQuizSessionQuestions] = useState(() => shuffleQuestions(questionBank).slice(0, QUESTIONS_PER_QUIZ));
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Ambil skor sesi aktif atau hasil terakhir yang tersimpan.
  const quizScore = currentAttempt?.score ?? quizHistory[0]?.score ?? null;

  // Muat progres sekali saat aplikasi dibuka; kegagalan storage tidak memblokir UI.
  useEffect(() => {
    let isMounted = true;
    async function loadSavedProgress() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted || !raw) return;
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.completedIds)) setCompletedIds(saved.completedIds);
        if (Array.isArray(saved.quizHistory)) setQuizHistory(saved.quizHistory);
      } catch (error) {
        // Data rusak atau storage tidak tersedia ditangani dengan aman.
      } finally {
        if (isMounted) setHasLoadedProgress(true);
      }
    }
    loadSavedProgress();
    return () => { isMounted = false; };
  }, []);

  // Simpan hanya sesudah hydration supaya state awal tidak menimpa data lama.
  useEffect(() => {
    if (!hasLoadedProgress) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ completedIds, quizHistory })).catch(() => {
      // UI tetap dapat digunakan meskipun perangkat menolak operasi penyimpanan.
    });
  }, [completedIds, quizHistory, hasLoadedProgress]);

  // Hitung jumlah materi yang selesai untuk statistik dashboard.
  const completedCount = completedIds.length;

  /** Membuka detail materi dan berpindah ke tab Materi. */
  function openLesson(lesson) {
    setSelectedLesson(lesson);
    setActiveTab('lessons');
  }

  /** Menandai satu materi selesai tanpa menambahkan id yang sama dua kali. */
  function completeLesson(lessonId) {
    setCompletedIds((currentIds) => currentIds.includes(lessonId) ? currentIds : [...currentIds, lessonId]);
  }

  /** Mereset seluruh state kuis untuk memulai sesi latihan yang baru. */
  function restartQuiz() {
    // Setiap pengulangan mengambil sampel acak baru dari bank soal.
    setQuizSessionQuestions(shuffleQuestions(questionBank).slice(0, QUESTIONS_PER_QUIZ));
    setCurrentAttempt(null);
    setSelectedReviewAttempt(null);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFeedbackVisible(false);
    setQuizFinished(false);
    setActiveTab('quiz');
  }

  /** Menyimpan jawaban yang dipilih pada soal aktif sebelum menampilkan pembahasan. */
  function checkAnswer() {
    if (selectedAnswer === null || feedbackVisible) return;
    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = selectedAnswer;
    setAnswers(nextAnswers);
    setFeedbackVisible(true);
  }

  /** Melanjutkan soal atau menghitung hasil ketika soal terakhir sudah diperiksa. */
  function nextQuestion() {
    if (questionIndex === quizSessionQuestions.length - 1) {
      // Tambahkan jawaban soal terakhir ke salinan array sebelum menghitung hasil.
      const finalAnswers = [...answers];
      finalAnswers[questionIndex] = selectedAnswer;
      const correctCount = quizSessionQuestions.reduce((total, question, index) => (
        total + (finalAnswers[index] === question.answer ? 1 : 0)
      ), 0);
      const attempt = {
        id: String(Date.now()),
        timestamp: Date.now(),
        score: Math.round((correctCount / quizSessionQuestions.length) * 100),
        correctCount,
        total: quizSessionQuestions.length,
        items: quizSessionQuestions.map((question, index) => ({
          ...question,
          selectedAnswer: finalAnswers[index] ?? null,
          isCorrect: finalAnswers[index] === question.answer,
        })),
      };
      setCurrentAttempt(attempt);
      setQuizHistory((existingHistory) => [attempt, ...existingHistory].slice(0, 20));
      setQuizFinished(true);
      return;
    }

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setSelectedAnswer(answers[nextIndex] ?? null);
    setFeedbackVisible(false);
  }

  // Review menjadi layar mandiri, tetapi jawaban asli tetap tersimpan di riwayat.
  const screen = useMemo(() => {
    if (selectedReviewAttempt) {
      return (
        <ReviewScreen
          reviewAttempt={selectedReviewAttempt}
          onBack={() => setSelectedReviewAttempt(null)}
          onOpenLesson={(lesson) => { setSelectedReviewAttempt(null); openLesson(lesson); }}
        />
      );
    }

    // Bila detail materi terbuka, tampilkan detail di atas navigasi tab yang sama.
    if (selectedLesson) {
      return (
        <LessonDetailScreen
          lesson={selectedLesson}
          completed={completedIds.includes(selectedLesson.id)}
          onBack={() => setSelectedLesson(null)}
          onComplete={completeLesson}
        />
      );
    }

    if (activeTab === 'lessons') {
      return <LessonsScreen completedIds={completedIds} onOpenLesson={openLesson} />;
    }

    if (activeTab === 'quiz') {
      return (
        <QuizScreen
          questions={quizSessionQuestions}
          attempt={currentAttempt}
          onReviewAttempt={setSelectedReviewAttempt}
          questionIndex={questionIndex}
          selectedAnswer={selectedAnswer}
          answers={answers}
          feedbackVisible={feedbackVisible}
          quizFinished={quizFinished}
          score={currentAttempt?.score ?? quizScore ?? 0}
          onSelectAnswer={setSelectedAnswer}
          onCheckAnswer={checkAnswer}
          onNextQuestion={nextQuestion}
          onRestart={restartQuiz}
        />
      );
    }

    if (activeTab === 'progress') {
      return (
        <ProgressScreen
          completedIds={completedIds}
          quizScore={quizScore}
          quizHistory={quizHistory}
          onOpenLesson={openLesson}
          onStartQuiz={restartQuiz}
          onReviewAttempt={setSelectedReviewAttempt}
        />
      );
    }

    return (
      <HomeScreen
        completedCount={completedCount}
        completedIds={completedIds}
        quizScore={quizScore}
        onOpenLesson={openLesson}
        onStartQuiz={restartQuiz}
        onSeeLessons={() => setActiveTab('lessons')}
      />
    );
  }, [activeTab, selectedLesson, selectedReviewAttempt, completedIds, questionIndex, selectedAnswer, answers, feedbackVisible, quizFinished, quizScore, completedCount, quizSessionQuestions, currentAttempt, quizHistory]);

  return (
    <SafeAreaView style={styles.appShell}>
      <ExpoStatusBar style="dark" backgroundColor={colors.paper} />
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <AppIcon name="flask" size={19} color={colors.lime} />
          </View>
          <View>
            <Text style={styles.brandName}>KULIAH LAB</Text>
            <Text style={styles.brandDescriptor}>BELAJAR DENGAN PAHAM</Text>
          </View>
        </View>
        <View style={styles.topBarRight}>
          <View style={styles.liveDot} />
          <Text style={styles.topBarLabel}>UTS PREP</Text>
        </View>
      </View>
      <View style={styles.screenArea}>
        {hasLoadedProgress ? screen : (
          <View style={styles.loadingState}>
            <AppIcon name="leaf-outline" size={26} color={colors.forest} />
            <Text style={styles.loadingText}>Memuat progres belajarmu…</Text>
          </View>
        )}
      </View>
      {hasLoadedProgress && !selectedLesson && !selectedReviewAttempt ? <BottomNavigation activeTab={activeTab} onChange={(tab) => { setSelectedLesson(null); setSelectedReviewAttempt(null); setActiveTab(tab); }} /> : null}
    </SafeAreaView>
  );
}

/** Styles menggunakan design tokens agar jarak, warna, dan radius konsisten. */
const styles = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: colors.paper },
  topBar: {
    minHeight: 70, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 15, fontWeight: '900', letterSpacing: 1.1, color: colors.ink },
  brandDescriptor: { marginTop: 2, fontSize: 9, letterSpacing: 1.1, fontWeight: '700', color: colors.muted },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest },
  topBarLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: colors.forest },
  screenArea: { flex: 1 },
  screenContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  welcomeCopy: { gap: 4 },
  greeting: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: colors.muted },
  welcomeName: { fontSize: 23, lineHeight: 29, fontWeight: '800', color: colors.ink, letterSpacing: -0.6 },
  avatarMark: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  heroCard: { overflow: 'hidden', backgroundColor: colors.forest, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg, position: 'relative' },
  heroTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 },
  eyebrow: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.sage },
  eyebrowGreen: { backgroundColor: colors.sage },
  eyebrowLime: { backgroundColor: colors.lime },
  eyebrowText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, color: colors.ink },
  eyebrowGreenText: { color: colors.forest },
  eyebrowLimeText: { color: colors.ink },
  heroTiny: { color: '#D2E1D7', fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  heroTitle: { fontSize: 33, lineHeight: 38, fontWeight: '900', letterSpacing: -1.2, color: colors.surface, zIndex: 1 },
  heroBody: { color: '#E0EBE4', fontSize: 14, lineHeight: 21, maxWidth: 290, zIndex: 1 },
  heroProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, marginTop: 2 },
  heroProgressLabel: { color: '#E0EBE4', fontSize: 12, fontWeight: '600' },
  heroProgressValue: { color: colors.surface, fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 7, borderRadius: radius.pill, backgroundColor: '#E5E8E1', overflow: 'hidden' },
  progressTrackLight: { backgroundColor: '#547D70' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.forest },
  progressFillLight: { backgroundColor: colors.lime },
  primaryButton: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.forest, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  primaryButtonText: { color: colors.surface, fontSize: 15, fontWeight: '800', letterSpacing: 0.1 },
  outlineButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.forest },
  outlineButtonText: { color: colors.forest },
  buttonDisabled: { opacity: 0.42 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  heroDecorOne: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#467867', top: -52, right: -35 },
  heroDecorTwo: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: '#467867', top: -20, right: -5 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, minHeight: 115, gap: 6 },
  statIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5, color: colors.ink },
  statLabel: { fontSize: 11, lineHeight: 15, color: colors.muted, fontWeight: '600' },
  sectionHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 25, fontWeight: '800', letterSpacing: -0.4 },
  sectionCaption: { marginTop: 4, fontSize: 12, lineHeight: 17, color: colors.muted },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
  textLinkLabel: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  lessonList: { gap: spacing.md },
  lessonCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  lessonCardCompact: { paddingVertical: 13 },
  cardPressed: { opacity: 0.78 },
  lessonIconWrap: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  lessonCopy: { flex: 1, gap: 5 },
  lessonMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lessonNumber: { color: colors.muted, fontSize: 9, letterSpacing: 0.8, fontWeight: '900' },
  dotSeparator: { color: colors.line, fontSize: 12 },
  lessonDuration: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  lessonTitle: { color: colors.ink, fontSize: 14, lineHeight: 19, fontWeight: '800' },
  lessonSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  lessonStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B8C0B9' },
  statusDotComplete: { backgroundColor: colors.forest },
  lessonStatus: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  lessonStatusComplete: { color: colors.forest },
  quizPromo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, backgroundColor: '#E9EBDD', borderWidth: 1, borderColor: '#DCE2D3' },
  quizPromoIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  quizPromoCopy: { flex: 1, gap: 4 },
  quizPromoTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  quizPromoText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  disclaimer: { marginTop: -spacing.md, color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  pageHeaderText: { flex: 1, gap: 5 },
  pageEyebrow: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  pageTitle: { color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: '900', letterSpacing: -0.9 },
  pageSubtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 330 },
  searchBox: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, minHeight: 48, fontSize: 14, color: colors.ink },
  listSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -spacing.md },
  listSummaryLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  listSummaryRight: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 45, paddingHorizontal: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, gap: spacing.md },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  backLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, paddingVertical: 5 },
  backLinkText: { color: colors.forest, fontSize: 13, fontWeight: '800' },
  detailIconLarge: { width: 60, height: 60, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: -spacing.md },
  detailTitle: { color: colors.ink, fontSize: 31, lineHeight: 37, fontWeight: '900', letterSpacing: -1 },
  detailSubtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: -spacing.md },
  detailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  detailMetaText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  metaDivider: { width: 1, height: 14, backgroundColor: colors.line, marginHorizontal: 4 },
  contentCard: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: spacing.md },
  contentLabel: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  bodyCopy: { color: colors.ink, fontSize: 15, lineHeight: 24 },
  keyPointsList: { gap: spacing.lg },
  keyPointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  keyPointNumber: { width: 31, height: 31, borderRadius: 11, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  keyPointNumberText: { color: colors.forest, fontSize: 10, fontWeight: '900' },
  keyPointCopy: { flex: 1, gap: 4, paddingTop: 2 },
  keyPointTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  keyPointDetail: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  codePanel: { backgroundColor: '#172823', borderRadius: radius.md, overflow: 'hidden' },
  codePanelHeader: { height: 46, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#30463E' },
  codeDots: { flexDirection: 'row', gap: 5 },
  codeDot: { width: 7, height: 7, borderRadius: 4 },
  codeFileLabel: { color: '#B7C9C0', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  codeText: { padding: spacing.lg, color: '#E1EFE7', fontFamily: 'monospace', fontSize: 12, lineHeight: 20 },
  takeawayCard: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.sage, borderRadius: radius.md, padding: spacing.lg },
  takeawayIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  takeawayCopy: { flex: 1, gap: 4 },
  takeawayTitle: { color: colors.forest, fontSize: 13, fontWeight: '900' },
  takeawayText: { color: colors.ink, fontSize: 13, lineHeight: 20 },
  bottomBreathingRoom: { height: 10 },
  quizProgressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quizQuestionCount: { color: colors.ink, fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  quizQuestionOf: { color: colors.muted, fontWeight: '700' },
  quizTopic: { color: colors.forest, fontSize: 11, fontWeight: '800', backgroundColor: colors.sage, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  questionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.xl, minHeight: 150, justifyContent: 'center' },
  questionText: { color: colors.ink, fontSize: 22, lineHeight: 30, fontWeight: '800', letterSpacing: -0.4 },
  answerList: { gap: spacing.sm },
  answerOption: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, borderRadius: radius.md },
  answerOptionSelected: { borderColor: colors.forest, backgroundColor: '#F0F5F0' },
  answerOptionCorrect: { borderColor: '#8AB79A', backgroundColor: colors.successSoft },
  answerOptionWrong: { borderColor: '#DDA397', backgroundColor: colors.coralSoft },
  answerLetter: { width: 31, height: 31, borderRadius: 11, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  answerLetterSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  answerLetterCorrect: { backgroundColor: colors.success, borderColor: colors.success },
  answerLetterWrong: { backgroundColor: colors.coral, borderColor: colors.coral },
  answerLetterText: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  answerLetterTextActive: { color: colors.surface },
  answerText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  feedbackCard: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm },
  feedbackCorrect: { backgroundColor: colors.successSoft, borderColor: '#C6E0CE' },
  feedbackWrong: { backgroundColor: colors.coralSoft, borderColor: '#EFD0C8' },
  feedbackHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  feedbackTitle: { fontSize: 14, fontWeight: '900' },
  feedbackText: { color: colors.ink, fontSize: 13, lineHeight: 20 },
  quizFootnote: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: -spacing.md },
  resultHero: { alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  resultIcon: { width: 68, height: 68, borderRadius: 24, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  resultTitle: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center' },
  resultSubtitle: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  resultScore: { color: colors.forest, fontSize: 58, lineHeight: 64, fontWeight: '900', letterSpacing: -2 },
  resultPercent: { fontSize: 25, letterSpacing: 0 },
  resultStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: spacing.sm },
  resultStat: { flex: 1, alignItems: 'center', gap: 3 },
  resultStatValue: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  resultStatLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  resultStatDivider: { width: 1, height: 32, backgroundColor: colors.line },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  loadingText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  mascotCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden', minHeight: 146 },
  mascotPortraitPressable: { width: 86, height: 132, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  mascotPortrait: { width: 80, height: 126, borderRadius: 15, overflow: 'hidden', backgroundColor: colors.sage },
  mascotImage: { width: '100%', height: '100%' },
  mascotSparkle: { position: 'absolute', top: 3, right: 0, width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  mascotContent: { flex: 1, gap: 5 },
  mascotEyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  mascotTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  mascotMessage: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  mascotActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  mascotChip: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sage },
  mascotChipText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  mascotChipPrimary: { backgroundColor: colors.forest },
  mascotChipTextPrimary: { color: colors.surface },
  mascotIconButton: { width: 28, height: 28, borderRadius: radius.pill, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  historyList: { gap: spacing.sm },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  historyScoreMark: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sage },
  historyScoreMarkText: { fontSize: 12, fontWeight: '900', color: colors.forest },
  historyCardCopy: { flex: 1, gap: 4 },
  historyCardTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  historyCardMeta: { fontSize: 11, color: colors.muted },
  historyReviewButton: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.sage },
  historyReviewText: { color: colors.forest, fontSize: 11, fontWeight: '900' },
  reviewQuestionCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  reviewMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  reviewNumber: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  reviewQuestion: { color: colors.ink, fontSize: 17, lineHeight: 24, fontWeight: '800' },
  reviewAnswerBox: { gap: 5, borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  reviewAnswerWrong: { backgroundColor: colors.coralSoft, borderColor: '#EFD0C8' },
  reviewAnswerCorrect: { backgroundColor: colors.successSoft, borderColor: '#C6E0CE' },
  reviewAnswerLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
  reviewAnswerText: { color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  reviewExplanation: { gap: 6, padding: spacing.md, backgroundColor: colors.paper, borderRadius: radius.md },
  progressOverview: { backgroundColor: colors.forest, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg },
  progressOverviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  progressOverviewLabel: { color: '#C4D8CD', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  progressOverviewTitle: { color: colors.surface, fontSize: 21, lineHeight: 28, fontWeight: '900', marginTop: 6 },
  progressOverviewPercent: { color: colors.lime, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  progressOverviewNote: { color: '#DDE9E1', fontSize: 12, lineHeight: 18 },
  nextStepCard: { backgroundColor: '#E9EBDD', borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  nextStepTitle: { color: colors.ink, fontSize: 20, lineHeight: 26, fontWeight: '900' },
  nextStepBody: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  bottomNav: { minHeight: 74, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: spacing.md, paddingTop: 7, paddingBottom: 7, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 54 },
  navIconWrap: { width: 42, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  navIconWrapActive: { backgroundColor: colors.forest },
  navLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: colors.forest, fontWeight: '900' },
});
