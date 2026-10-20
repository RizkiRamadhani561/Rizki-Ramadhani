# PRD — KULIAH LAB

**Versi:** 1.0 · **Platform:** React Native + Expo · **Bahasa:** Indonesia

## Ringkasan
KULIAH LAB adalah aplikasi belajar mandiri untuk mahasiswa Manajemen Informatika yang menyiapkan UTS Mobile Programming. Materi dibagi menjadi pelajaran singkat, contoh kode berkomentar, kuis dengan pembahasan, dan progres belajar.

## Masalah pengguna
- Catatan komponen, state, props, useState, dan flexDirection sering terpisah.
- Istilah mirip mudah tertukar saat ujian teori.
- Latihan pilihan ganda kurang efektif jika tidak menjelaskan alasan jawaban.

## Target pengguna
Mahasiswa D3 Manajemen Informatika yang mempelajari React Native untuk ujian teori dan praktik dasar.

## Tujuan MVP
1. Memahami komponen inti React Native.
2. Membedakan state dan props.
3. Melihat pola useState dan setter.
4. Memahami flexDirection.
5. Menyelesaikan kuis 10 soal dan membaca pembahasan.

## Ruang lingkup
**Termasuk:** dashboard, katalog dan detail materi, contoh kode, pencarian materi, kuis pilihan ganda, feedback, hasil skor, checklist progres, empat tab navigasi.

**Tidak termasuk:** login, backend, sinkronisasi cloud, leaderboard, analytics, editor kode yang menjalankan program. Progres disimpan lokal menggunakan AsyncStorage; tidak disinkronkan antarperangkat.

## Arsitektur informasi
- **Beranda:** progres, aksi lanjut belajar, pintasan kuis.
- **Materi:** pencarian, katalog, status penyelesaian.
- **Detail materi:** ringkasan, poin kunci, kode, takeaway.
- **Kuis:** soal, pilihan, feedback, pembahasan, hasil.
- **Progres:** modul selesai, skor terakhir, rekomendasi berikutnya.

## Acceptance criteria
- Kartu materi membuka detail yang tepat.
- Tombol tandai selesai memperbarui checklist tanpa duplikasi.
- Pilihan jawaban bisa dipilih dan tombol periksa nonaktif sebelum pilihan dibuat.
- Setelah pemeriksaan, feedback dan penjelasan tampil.
- Setelah soal terakhir, skor ditampilkan dan kuis bisa diulang.
- Sesi baru mengambil 10 soal unik secara acak dari bank soal yang lebih besar.
- Progres materi, skor, dan riwayat hingga 20 sesi tetap tersedia setelah aplikasi/browser dibuka kembali.
- Review menampilkan jawaban pengguna, jawaban benar, penjelasan, dan pintasan ke materi terkait.
- Maskot Mika memiliki animasi mengambang dan respons visual/tips ketika ditekan.
- Empat tab utama bisa dibuka dari navigasi bawah.

## UX dan aksesibilitas
Gunakan satu aksi utama yang jelas, target sentuh sekitar 44–48 dp atau lebih, kontras memadai, label teks untuk ikon navigasi, dan status yang tidak hanya dibedakan dengan warna. Uji ukuran font besar serta screen reader sebelum rilis.

## Batasan
Data bersifat lokal dan tidak disinkronkan antarperangkat. Browser dapat menghapus data lokal jika pengguna membersihkan storage. Latihan bukan bocoran atau jaminan soal resmi UTS.

## Definition of Done
- [ ] Aplikasi berjalan di Expo.
- [ ] Navigasi, detail materi, pencarian, kuis, feedback, dan progres berfungsi.
- [ ] README dan dokumentasi desain tersedia.
- [ ] Build diuji pada perangkat target.
