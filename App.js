import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  TextInput,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from './src/theme';
import { lessons, quizQuestions } from './src/data/lessons';

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

/** Beranda berisi CTA utama dan materi yang disarankan untuk dilanjutkan. */
function HomeScreen({ completedCount, quizScore, onOpenLesson, onStartQuiz, onSeeLessons }) {
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
            completed={lesson._completed === true}
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
    const correctCount = Math.round((score / 100) * quizQuestions.length);
    return (
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.resultHero}>
          <View style={styles.resultIcon}>
            <AppIcon name={score >= 70 ? 'trophy-outline' : 'book-outline'} size={34} color={colors.forest} />
          </View>
          <Eyebrow tone="green">SESI SELESAI</Eyebrow>
          <Text style={styles.resultTitle}>{score >= 80 ? 'Mantap, gas terus!' : score >= 60 ? 'Progres yang bagus.' : 'Saatnya review lagi.'}</Text>
          <Text style={styles.resultSubtitle}>Hasil latihan UTS Mobile Programming lu.</Text>
          <Text style={styles.resultScore}>{score}<Text style={styles.resultPercent}>%</Text></Text>
          <ProgressBar value={score} />
          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{correctCount}</Text>
              <Text style={styles.resultStatLabel}>Jawaban benar</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{quizQuestions.length - correctCount}</Text>
              <Text style={styles.resultStatLabel}>Perlu diulang</Text>
            </View>
          </View>
        </View>
        <View style={styles.contentCard}>
          <Text style={styles.contentLabel}>REKOMENDASI BERIKUTNYA</Text>
          <Text style={styles.bodyCopy}>Buka kembali materi yang masih terasa sulit, lalu ulangi kuis untuk menguji pemahaman. Fokus pada alasan di balik jawaban, bukan sekadar menghafal.</Text>
        </View>
        <PrimaryButton label="Ulangi kuis" icon="refresh" onPress={onRestart} />
      </ScrollView>
    );
  }

  const question = quizQuestions[questionIndex];
  const selectedIsCorrect = selectedAnswer === question.answer;

  return (
    <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="PRACTICE / UTS" title="Uji pemahaman" subtitle="Pilih jawaban terbaik, lalu baca pembahasannya." />
      <View style={styles.quizProgressHeader}>
        <Text style={styles.quizQuestionCount}>SOAL {String(questionIndex + 1).padStart(2, '0')} <Text style={styles.quizQuestionOf}>/ {String(quizQuestions.length).padStart(2, '0')}</Text></Text>
        <Text style={styles.quizTopic}>{question.topic}</Text>
      </View>
      <ProgressBar value={((questionIndex + 1) / quizQuestions.length) * 100} />
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
        <PrimaryButton label={questionIndex === quizQuestions.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'} icon="arrow-forward" onPress={onNextQuestion} />
      )}
      <Text style={styles.quizFootnote}>Jawaban tersimpan selama sesi kuis ini berlangsung.</Text>
    </ScrollView>
  );
}

/** Ringkasan progres dari materi yang ditandai selesai dan skor kuis terakhir. */
function ProgressScreen({ completedIds, quizScore, onOpenLesson, onStartQuiz }) {
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
  // completedIds menyimpan id materi yang telah ditandai selesai selama sesi aplikasi.
  const [completedIds, setCompletedIds] = useState(['components']);
  // Kumpulan state kuis: indeks soal, jawaban, feedback, dan status selesai.
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Hitung jumlah materi selesai dari daftar id yang tersimpan.
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
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFeedbackVisible(false);
    setQuizFinished(false);
    setQuizScore(null);
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
    if (questionIndex === quizQuestions.length - 1) {
      const correctCount = quizQuestions.reduce((total, question, index) => {
        const answerForQuestion = index === questionIndex ? selectedAnswer : answers[index];
        return total + (answerForQuestion === question.answer ? 1 : 0);
      }, 0);
      setQuizScore(Math.round((correctCount / quizQuestions.length) * 100));
      setQuizFinished(true);
      return;
    }

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setSelectedAnswer(answers[nextIndex] ?? null);
    setFeedbackVisible(false);
  }

  // Bila detail materi terbuka, tampilkan detail di atas navigasi tab yang sama.
  const screen = useMemo(() => {
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
          questionIndex={questionIndex}
          selectedAnswer={selectedAnswer}
          answers={answers}
          feedbackVisible={feedbackVisible}
          quizFinished={quizFinished}
          score={quizScore ?? 0}
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
          onOpenLesson={openLesson}
          onStartQuiz={restartQuiz}
        />
      );
    }

    return (
      <HomeScreen
        completedCount={completedCount}
        quizScore={quizScore}
        onOpenLesson={openLesson}
        onStartQuiz={restartQuiz}
        onSeeLessons={() => setActiveTab('lessons')}
      />
    );
  }, [activeTab, selectedLesson, completedIds, questionIndex, selectedAnswer, answers, feedbackVisible, quizFinished, quizScore, completedCount]);

  return (
    <SafeAreaView style={styles.appShell}>
      <ExpoStatusBar style="dark" backgroundColor={colors.paper} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
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
      <View style={styles.screenArea}>{screen}</View>
      {!selectedLesson ? <BottomNavigation activeTab={activeTab} onChange={(tab) => { setSelectedLesson(null); setActiveTab(tab); }} /> : null}
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
  sectionTitle: { color: colors.ink, fontSize: 19, lineHeight: 25, fontWeight: '850', letterSpacing: -0.4 },
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
  quizPromoTitle: { color: colors.ink, fontSize: 14, fontWeight: '850' },
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
  keyPointTitle: { color: colors.ink, fontSize: 15, fontWeight: '850' },
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
  questionText: { color: colors.ink, fontSize: 22, lineHeight: 30, fontWeight: '850', letterSpacing: -0.4 },
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
  answerText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '650' },
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
