# KULIAH LAB

Aplikasi belajar **React Native untuk persiapan UTS Mobile Programming** mahasiswa Manajemen Informatika. Fokus pada component, state, props, `useState`, dan `flexDirection`.

## Fitur MVP

- Dashboard belajar dengan progres dan CTA melanjutkan materi.
- Empat modul dengan ringkasan, poin penting, kode berkomentar, dan takeaway.
- Pencarian materi secara lokal.
- Kuis 10 soal pilihan ganda dengan feedback dan pembahasan.
- Skor akhir dan checklist progres.
- Desain mobile-first dengan warna hangat, hijau hutan, aksen lime, dan komponen reusable.

## Stack

- React Native
- Expo SDK 54
- JavaScript
- @expo/vector-icons

## Jalankan di komputer

1. Install Node.js versi LTS.
2. Clone repository ini.
3. Pasang dependency dan jalankan Expo:

```bash
npm install
npx expo start
```

Scan QR dengan Expo Go untuk membuka di ponsel. Untuk web preview, jalankan `npm run web` setelah dependency terpasang.

> Jika Expo SDK terbaru telah berubah saat kamu menyiapkan lingkungan, ikuti panduan migrasi resmi Expo dan pastikan versi React Native cocok dengan SDK di `package.json`.

## Struktur proyek

```text
.
├── App.js                  # Root app, navigasi, layar, state kuis
├── app.json                # Metadata Expo
├── package.json            # Dependency dan script
├── src/
│   ├── data/
│   │   └── lessons.js      # Konten modul dan bank soal
│   └── theme.js            # Design tokens
└── docs/
    ├── PRD.md              # Product Requirements Document
    └── DESIGN-SYSTEM.md    # Arah visual, token, dan aturan UI
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
- Data progres hanya disimpan dalam state selama sesi; belum ada penyimpanan permanen atau backend.
- Contoh kode di dalam modul adalah bahan belajar dan tidak dieksekusi oleh aplikasi.
- Periksa dokumentasi resmi untuk perubahan versi:
  - [Expo Router](https://docs.expo.dev/router/introduction/)
  - [React Native Flexbox](https://reactnative.dev/docs/flexbox)
  - [React useState](https://react.dev/reference/react/useState)

## Roadmap

- [ ] Tambahkan penyimpanan progres lokal.
- [ ] Tambahkan mode gelap.
- [ ] Pisahkan layar menjadi file komponen setelah materi dasar dipahami.
- [ ] Uji ukuran teks besar, screen reader, dan perangkat Android/iOS.
- [ ] Upgrade SDK setelah memeriksa kompatibilitas dependency.
