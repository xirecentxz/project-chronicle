# Congklak (Sungka / Mancala)

Game congklak tradisional dibangun dengan React 18 + TypeScript + Tailwind CSS + Framer Motion.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Build untuk produksi

```bash
npm run build
npm run preview   # cek hasil build secara lokal
```

Hasil build ada di folder `dist/`.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, push kode ini ke sana.
2. Ubah `base` di `vite.config.ts` menjadi `'/nama-repo-kamu/'`.
3. Install `gh-pages` sudah termasuk di `devDependencies`.
4. Jalankan:
   ```bash
   npm run deploy
   ```
5. Aktifkan GitHub Pages di Settings repo, pilih branch `gh-pages`.

## Struktur Proyek

```
src/
├── components/
│   ├── Board.tsx           # Layout papan, kontrol, layar menang
│   ├── Hole.tsx             # Lubang kecil (biji + interaksi)
│   ├── Store.tsx            # Lumbung besar (skor)
│   ├── Toast.tsx            # Notifikasi aksi
│   ├── Menu.tsx              # Menu utama (PvP / PvE + difficulty)
│   └── LandscapeOverlay.tsx # Kunci orientasi landscape (mobile)
├── hooks/
│   ├── useGameLogic.ts      # State management utama (useReducer)
│   └── useAI.ts             # Delay & eksekusi giliran AI
├── utils/
│   ├── gameEngine.ts        # Aturan inti: sow, capture, win condition
│   ├── aiEngine.ts          # AI: Easy (random), Normal (greedy), Hard (minimax+AB)
│   └── sound.ts             # Efek suara Web Audio API (sintesis nada)
├── types/
│   └── index.ts
└── App.tsx
```

## Aturan Permainan (ringkas)

- 16 lubang: 14 kecil (7 per pemain) + 2 lumbung besar.
- Sebar biji searah counter-clockwise, lumbung lawan dilewati.
- Biji terakhir di lumbung sendiri → giliran ekstra.
- Biji terakhir di lubang berisi → ambil semua, lanjut sebar (panen beruntun).
- Biji terakhir di lubang kosong milik sendiri → "nembak", ambil biji lawan di seberang.
- Biji terakhir di lubang kosong milik lawan → giliran selesai.
- Jika satu sisi kehabisan biji, sisa biji sisi lain masuk ke lumbungnya sendiri.
- Skor lumbung terbanyak menang; jika sama → Draw.

## Catatan Implementasi

- Efek suara memakai Web Audio API (oscillator sintesis), sehingga game tetap
  satu paket tanpa perlu file `.mp3` eksternal saat di-deploy ke GitHub Pages.
- Undo menyimpan maksimal 20 langkah terakhir di memori (tidak persisten).
- AI Hard menggunakan Minimax depth 4 dengan Alpha-Beta Pruning, fungsi evaluasi:
  `(storeAI*3) + (sisiAI*1) - (storePlayer*2) - (sisiPlayer*0.5)`.
