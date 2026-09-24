# Ihya' Dev Pass

Portfolio of Ihya' Nashirudin Abrar, developer in Pontianak and Master of Informatics student at Universitas Ahmad Dahlan.

The hero is a physics-driven ID card on a lanyard: drag it, toss it, double-click to flip it to the QR side. The rest of the page follows the event-pass idea: projects are tickets, papers are talks, and the contact block is the pass you take home.

## Stack

- Vite, React 19, TypeScript
- React Three Fiber, Rapier (one rope joint), meshline for the strap
- Card faces drawn with the 2D canvas API (`src/lib/cardArt.ts`, `src/lib/cardBack.ts`), shown first as a static poster while the 3D chunk loads

## Run

```bash
npm install
npm run dev
```

`npm run build` writes the site to `dist/`. At build time it reads the public repository count from the GitHub API (set `GITHUB_TOKEN` to avoid rate limits) and, on Vercel, uses the production domain for Open Graph URLs.

## Content

- All copy lives in `src/content.ts`.
- Design direction and palette: `DESIGN.md`.
- The CV is generated from the same facts: `python scripts/make_cv.py public/Ihya-Nashirudin-Abrar-CV.pdf` (needs `reportlab`).
