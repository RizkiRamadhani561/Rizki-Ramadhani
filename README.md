# KULIAH LAB

Aplikasi belajar **React Native untuk persiapan UTS Mobile Programming** mahasiswa Manajemen Informatika. Fokus pada component, state, props, `useState`, dan `flexDirection`.

## 🌐 Live demo — GitHub Pages

Setelah workflow GitHub Actions selesai dan Pages diaktifkan, aplikasi web tersedia di:

**https://rizkiramadhani561.github.io/Rizki-Ramadhani/**

Setiap push ke branch `main` akan otomatis membangun ulang versi web dan menerbitkannya ke GitHub Pages.

### Pengaturan GitHub Pages (cukup sekali)

1. Buka **Settings → Pages** pada repository.
2. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
3. Buka tab **Actions** dan tunggu workflow **Deploy Expo Web to GitHub Pages** selesai dengan status sukses.

## Fitur MVP

- Dashboard belajar dengan progres dan CTA melanjutkan materi.
- Empat modul dengan ringkasan, poin penting, kode berkomentar, dan takeaway.
- Pencarian materi secara lokal.
- Kuis 10 soal pilihan ganda yang diacak dari bank 40+ soal, dengan feedback dan pembahasan.
- Review jawaban salah, jawaban benar, penjelasan, dan pintasan ke materi terkait.
- Progres materi tersimpan lokal, riwayat hingga 20 sesi kuis, dan skor terakhir.
- Maskot anime interaktif Mika dengan animasi melayang, respons sentuhan, tips, dan pintasan kuis/materi.
- Desain mobile-first dengan warna hangat, hijau hutan, aksen lime, dan komponen reusable.

## Stack

- React Native
- Expo SDK 54
- JavaScript
- `@expo/vector-icons`
- React Native Web untuk versi browser

## Jalankan di komputer

1. Install Node.js versi LTS.
2. Clone repository ini.
3. Pasang dependency dan jalankan Expo:

```bash
git clone https://github.com/RizkiRamadhani561/Rizki-Ramadhani.git
cd Rizki-Ramadhani
npm install
npx expo start
```

Scan QR dengan Expo Go untuk membuka di ponsel. Untuk melihat web dalam mode development, jalankan:

```bash
npm run web
```

Untuk membuat hasil build web secara lokal:

```bash
npm run build:web
```

Hasil build berada di folder `dist/`. Di CI GitHub Actions, hasil build ini otomatis diunggah ke GitHub Pages.

## Struktur proyek

```text
.
├── App.js                  # Root app, navigasi, layar, state kuis, dan maskot Mika
├── assets/
│   └── mascot.jpg          # Ilustrasi karakter anime untuk study buddy
├── app.json                # Metadata Expo dan base path GitHub Pages
├── package.json            # Dependency dan script
├── .github/
│   └── workflows/
│       └── deploy-pages.yml # Build dan deploy otomatis
├── src/
│   ├── data/
│   │   ├── lessons.js      # Konten modul
│   │   └── quizBank.js     # Bank soal acak beserta kunci/pembahasan
│   └── theme.js            # Design tokens
└── docs/
    ├── PRD.md              # Product Requirements Document
    ├── DESIGN-SYSTEM.md    # Arah visual, token, dan aturan UI
    └── UX-PILOT-PROMPT.md  # Brief untuk membuat mockup UI
```

## Konsep React Native yang dipelajari

- `View`: container layout.
- `Text`: menampilkan tulisan.
- `Image`: menampilkan gambar.
- `TextInput`: menerima input.
- `Pressable` / `Button`: interaksi.
- `useState`: state dan fungsi setter.
- Props: data yang dikirim parent ke child.
- `flexDirection`: `column`, `row`, `column-reverse`, dan `row-reverse`.

## Catatan belajar

- Soal dalam aplikasi adalah **latihan berdasarkan kisi-kisi**, bukan bocoran atau jaminan soal resmi.
- Progres materi dan riwayat kuis disimpan lokal pada perangkat/browser melalui AsyncStorage; data tidak disinkronkan antarperangkat dan tidak memerlukan akun.
- Hingga 20 sesi kuis terakhir disimpan, termasuk jawaban tiap soal agar review tetap tersedia setelah aplikasi dibuka kembali.
- Build web diperiksa melalui GitHub Actions. Tampilan pada perangkat Android/iOS nyata tetap perlu diuji dengan Expo Go sebelum rilis mobile.
- Contoh kode di dalam modul adalah bahan belajar dan tidak dieksekusi oleh aplikasi.
- GitHub Pages menjalankan versi web dari aplikasi; tidak menggantikan instalasi aplikasi Android/iOS.
- Periksa dokumentasi resmi untuk perubahan versi:
  - [Panduan Expo untuk publikasi website](https://docs.expo.dev/guides/publishing-websites/)
  - [Expo Router](https://docs.expo.dev/router/introduction/)
  - [React Native Flexbox](https://reactnative.dev/docs/flexbox)
  - [React useState](https://react.dev/reference/react/useState)

## Roadmap

- [ ] Tambahkan penyimpanan progres lokal.
- [ ] Tambahkan mode gelap.
- [ ] Pisahkan layar menjadi file komponen setelah materi dasar dipahami.
- [ ] Uji ukuran teks besar, screen reader, dan perangkat Android/iOS.
- [ ] Upgrade SDK setelah memeriksa kompatibilitas dependency.
