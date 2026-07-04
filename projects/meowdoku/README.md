# 🐾 Meowdoku

Puzzle logika 8×8 ala *Queens*: tempatkan satu kucing 🐱 di setiap **baris**, **kolom**, dan **wilayah warna** — tanpa ada dua kucing yang saling bersentuhan (termasuk diagonal).

Fitur:
- Glassmorphism + Soft UI, gradient krem-peach, font Poppins
- Papan digenerate acak setiap game baru (region tumbuh dari solusi valid, dicek agar solusi unik)
- Mode ❌ Eliminasi & Mode 🐱 Kucing, plus Mode Pintar ✨ (klik kanan di papan)
- Sistem nyawa ❤️❤️❤️, penghitung kucing, timer, rating bintang saat menang
- Efek suara disintesis langsung (Web Audio API) — tanpa file audio eksternal
- Dark mode, kontrol volume, HUD & navigasi ala Instagram (dekoratif)
- Responsif untuk mobile, tablet, dan desktop

## Menjalankan secara lokal
Cukup buka `index.html` langsung di browser — tidak ada dependensi atau proses build.

## Deploy ke GitHub Pages
1. Buat repository baru (mis. `meowdoku`) dan push kedua file ini (`index.html`, `README.md`) ke branch `main`.
2. Masuk ke **Settings → Pages**.
3. Pada **Source**, pilih branch `main` dan folder `/ (root)`.
4. Simpan — situs akan tersedia di `https://<username>.github.io/meowdoku/` setelah beberapa menit.

Selamat bermain! 🐾
