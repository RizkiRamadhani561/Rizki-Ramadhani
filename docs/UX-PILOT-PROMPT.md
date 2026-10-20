# UX Pilot Brief — KULIAH LAB

Gunakan brief ini untuk membuat mockup high-fidelity mobile di UX Pilot. Targetnya desain produk yang bisa diimplementasikan, bukan visual concept art.

## Product context
KULIAH LAB adalah aplikasi belajar mandiri untuk mahasiswa D3 Manajemen Informatika yang mempersiapkan UTS Mobile Programming. Fokus materi: React Native components, state vs props, useState, dan flexDirection. Bahasa UI: Bahasa Indonesia yang santai, jelas, dan tidak terlalu slang.

## Screen list
1. **Beranda** — sapaan singkat, hero CTA “Lanjut belajar”, progres materi, statistik sederhana, rekomendasi modul, pintasan kuis.
2. **Materi** — pencarian, daftar modul, durasi, status selesai/belum selesai, empty state saat hasil pencarian kosong.
3. **Detail materi** — judul, ringkasan, poin inti, snippet kode monospace dengan komentar, takeaway “Ingat buat UTS”, tombol tandai selesai.
4. **Kuis** — progress soal, pertanyaan, empat pilihan, state selected, state benar/salah, pembahasan dan tombol soal berikutnya.
5. **Hasil kuis** — skor, jumlah benar/salah, pesan yang suportif, aksi ulangi kuis.
6. **Progres** — modul selesai, skor terakhir, checklist dan rekomendasi langkah berikutnya.

## Art direction
- Editorial learning product: confident, calm, practical, slightly playful.
- Avoid generic AI UI: no large gradient blobs, no unnecessary glassmorphism, no identical cards repeated everywhere, no meaningless charts or fake metrics.
- Build hierarchy with typography, whitespace, restrained borders, and intentional contrast.
- Use realistic Indonesian content, never lorem ipsum.

## Design tokens
- Paper background: #F7F5EF
- Main ink: #17211F
- Forest brand: #1F5B4B
- Dark forest: #164638
- Lime accent: #C9F06A
- Sage surface: #E2E9DF
- Border: #E1E4DC
- Incorrect answer: #B94E3D
- Correct answer: #276749
- Heading direction: Space Grotesk Bold
- Body direction: Inter
- Code direction: IBM Plex Mono
- Spacing rhythm: 4/8 dp scale
- Card radius: 16 dp; large panel radius: 22 dp

## UX and accessibility requirements
- Android-first viewport around 390 × 844; responsive to smaller devices.
- Four bottom navigation items: Beranda, Materi, Kuis, Progres.
- Touch targets 44–48 dp or larger.
- Always show text labels with bottom navigation icons.
- Visible keyboard/focus and selected/disabled states.
- Do not use color alone to distinguish quiz feedback.
- Use at least 16 px body text for reading when space permits.
- Include empty search, quiz feedback, and completed-lesson states.
- No login gate or unnecessary onboarding for this MVP.

## Deliverable
Create a coherent multi-screen mobile design with reusable component rules, spacing/type/color tokens, and implementation-ready screen specs. Use reference products only to learn interaction patterns; do not reproduce any brand's proprietary visual design.

## Implementation alignment
The GitHub repository already contains an Expo MVP. Treat this brief as the design direction for future polish and compare the mockup against `App.js`, `src/theme.js`, and `docs/DESIGN-SYSTEM.md`.