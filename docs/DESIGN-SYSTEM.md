# KULIAH LAB — Design System

## Arah visual
Editorial, tenang, terstruktur, akademik, dengan aksen lime secukupnya. Hindari gradient dekoratif, glassmorphism berlebihan, serta kartu dengan bobot visual sama. Hierarki dibuat melalui tipografi, ruang kosong, kontras, dan posisi konten.

## Color tokens
| Token | Hex | Penggunaan |
|---|---|---|
| paper | #F7F5EF | Latar utama hangat |
| surface | #FFFFFF | Kartu/panel |
| ink | #17211F | Teks utama |
| muted | #65716B | Teks sekunder |
| forest | #1F5B4B | Identitas dan CTA |
| forest-dark | #164638 | Penekanan |
| lime | #C9F06A | Aksen progres |
| sage | #E2E9DF | Permukaan lembut |
| line | #E1E4DC | Border/divider |
| coral | #B94E3D | Feedback salah |
| success | #276749 | Feedback benar |

Verifikasi kontras final terhadap WCAG 2.2 AA sebelum rilis. Status harus memiliki teks, bukan warna saja.

## Tipografi
- Heading: Space Grotesk Bold sebagai arah pairing.
- Body: Inter atau system sans-serif.
- Code: IBM Plex Mono atau monospace.
- Skala: 12, 14, 16, 18, 20, 26, 34.

Implementasi MVP memakai font system agar setup sederhana; pairing font khusus bisa ditambahkan setelah dependency font dipasang.

**Batasan maskot:** aset yang tersedia saat ini adalah ilustrasi statis `assets/mika.jpg`. Animasi web dan native menggerakkan gambar secara utuh, bukan menggerakkan mata/mulut sebagai bagian terpisah. Untuk animasi Live2D yang dirigging, tambahkan model Cubism resmi beserta tekstur, motion, dan ekspresi yang lisensinya mengizinkan distribusi aplikasi.

## Spacing dan bentuk
Gunakan rhythm 4/8 dp: 4, 8, 12, 16, 24, 32, 40. Radius: 10 untuk kontrol kecil, 16 untuk kartu, 22 untuk panel utama. Border tipis; shadow hanya bila membantu membedakan layer.

## Komponen
- **Primary button:** tinggi minimal 48 dp, label berbentuk kata kerja, state disabled yang tetap terbaca.
- **Lesson card:** nomor, kategori, judul, durasi, dan status.
- **Code panel:** latar gelap, monospace, snippet berkomentar, scroll horizontal bila perlu.
- **Quiz option:** area tekan luas, state selected/correct/incorrect, pembahasan setelah submit.
- **Progress:** tampilkan angka atau teks bersama bar.
- **Bottom navigation:** empat tujuan: Beranda, Materi, Kuis, Progres; label selalu terlihat.
- **Mika / study buddy:** portrait anime lokal `assets/mika.jpg`. Versi web memakai Motion (`motion/react`) untuk floating, hover tilt dengan perspektif `rotateX`/`rotateY`, dan respons tap. Versi Android/iOS memakai React Native Animated agar tetap lintas platform.

## Aksesibilitas
- Label teks pada navigasi dan aksi penting.
- Target sentuh direkomendasikan 44–48 dp atau lebih.
- Jangan mengandalkan warna saja untuk feedback.
- Maskot memiliki deskripsi aksesibilitas; tips dapat diaktifkan melalui kontrol yang berlabel jelas. Animasi web menghormati preferensi reduced-motion.
- Urutan baca mengikuti urutan visual.
- Uji font besar, layar kecil, dan screen reader.

## Referensi teknis
- React Native Flexbox: https://reactnative.dev/docs/flexbox
- React useState: https://react.dev/reference/react/useState
- Expo Router: https://docs.expo.dev/router/introduction/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

## Catatan implementasi
Design tokens aktif berada di `src/theme.js`. Implementasi maskot dipisahkan sebagai `MascotCoach.web.js` dan `MascotCoach.native.js`, sehingga dependensi browser-only tidak masuk ke bundel Android/iOS. Referensi visual Mobbin tidak digunakan karena akses pencariannya membutuhkan paket berbayar; tidak ada tampilan brand lain yang disalin.
