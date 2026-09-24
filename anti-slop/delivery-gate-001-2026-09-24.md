# Delivery Gate 001 (2026-09-24): full redesign

Design Read: personal developer and researcher portfolio for recruiters, collaborators and supervisors, in a printed event-pass language (badge, ticket, programme). Dial ENERGY 3 / RHYTHM 3 / MOTION 2. Direction: `DESIGN.md` (owner approved identity, palette, dials).

## Block 1: Hard Gate

| Rule | Result | Evidence |
|---|---|---|
| R-02 em dash | PASS | `grep "—"` over `index.html`, `src/`, `DESIGN.md`, `CLAUDE.md`: no hits. Date ranges written as "2018 to 2022". The owner's README line had an em dash; the site uses the owner's GitHub bio version, which has none. |
| R-03 mobile | PASS | 375 px: `scrollWidth` 375 = viewport. 820 px: 805 + scrollbar. Nav collapses to a labelled "Menu" button at 820 px. Targets measured at 44 px or more (EN/ID and email link raised from 42 and 28 px). |
| R-17 numbers | PASS | 32 repositories (GitHub API), 2 papers (Sisfokom 2023 and 2026), 2018 (LinkedIn export). Each figure links to its source. |
| R-18 testimonials | PASS | None on the page. |
| R-23 assets | PASS | Photo supplied by the owner. Logo is the text "ihya." No generated people or logos. |
| R-24 navigation | PASS | Script check: 33 links, 0 in-page anchors pointing at a missing id. |
| R-25 contrast | PASS | `contrast-check.py`: muted on paper 5.68, accent on paper 4.85, white on accent 5.49, on-ink-muted on ink 7.80, copy error text 7.89, muted on raised 6.04. The old accent #e0601a (3.17) was replaced. |
| R-26 dead controls | PASS | Every button has a handler; every link has a real target (14 external URLs, 2 mailto, 5 section anchors). |
| R-27 states | PASS | 3D card: a static poster of the same card is the loading state, then the 3D card takes its place; WebGL missing or a crash keeps the poster and says "The interactive card could not load on this device, so this one is a still image." (failure path verified by code inspection, WebGL was available in testing). Copy button: success and failure messages; failure path shown in testing. |
| R-28 FAQ | PASS | No FAQ. |
| R-32 keyboard | PASS | Real Tab presses: order follows the layout, outline visible (`outline: solid`). The hidden "Flip the ID card" button appears on focus (136 x 44) and Enter flipped the card. Menu closes with Escape and returns focus to the Menu button. Skip link to `#main`. |
| R-33 patch scripts | PASS | Features live in source. (Earlier sessions used one-off edit commands during development; nothing ships that rewrites files.) |
| R-34 themes | PASS | One light theme by owner decision; no toggle shipped. |
| R-35 verified | PASS | `tsc -b` and `vite build` pass. Fresh load: no console errors (only three.js and Rapier deprecation warnings). Click-through below. |
| R-36 claims | PASS | No security, compliance or performance claims. |
| R-37 direction | PASS | `DESIGN.md`, dials declared. |
| R-38 real content | PASS | All content from GitHub, the LinkedIn export and the papers. The unverified "LinkedIn Learning" label on certificates was removed. |

Click-through (desktop 1280 and mobile 375):
- See my projects -> scrolls to `#projects`
- Email me -> `mailto:ihyakpati1144@gmail.com`
- Nav links (desktop) and Menu links (mobile) -> `#about`, `#projects`, `#research`, `#timeline`, `#contact`; the menu closes after a link
- Menu -> opens; Escape -> closes, focus back on Menu
- EN / ID -> headline switches language, `<html lang>` follows, choice saved
- Flip the ID card (keyboard) -> card shows the QR side
- Drag and toss (earlier physics test) -> rope stretch 0.003, no NaN, card returns
- Ticket and row titles -> GitHub repositories; Open the live site -> gerai-bkmt.vercel.app
- Research links -> DOI, journal page, notebooks repository
- Copy -> clipboard refused in the test browser, the failure message appeared; the success path was not observable there
- Contact stub -> LinkedIn, GitHub, Instagram, ORCID

## Block 2: Purpose-Gate

| Rule | Result | Reason written |
|---|---|---|
| R-01 gradients/glow | PASS | Only gradient: the metal rail. It depicts a physical object. |
| R-04 icons | PASS | No icon set. The only glyph is ↗ on links that leave the site. |
| R-06 typography | PASS | Archivo: condensed width matches badge and poster printing. IBM Plex Mono only for ticket data (dates, serials, stacks), no wide tracking, no uppercase labels. |
| R-07 background pattern | PASS | None. The perforation is a divider and the identity motif. |
| R-08 arrows | PASS | ↗ marks external links only; primary buttons carry none. |
| R-09 badges | PASS | "Live" marks the one product in production; "Current" marks ongoing timeline rows. Both mark real states. No eyebrow pill above the H1. |
| R-10 glass | PASS | None. |
| R-12 shadow | PASS | Two: the rail (the one object standing off the page) and the open mobile menu (it floats over content). |
| R-13 glow | PASS | None. |
| R-14 cards | PASS | Three sizes by weight: full ticket for the product in daily use, half tickets for the two flagships, rows for the rest. |
| R-19 motion | PASS | Lanyard physics (the hero interaction), timeline rule that fills with the reader (shows position in the chronology), hover states. The removed pulsing dots were decorative loops. Sway stops under reduced motion. |
| R-22 illustrations | PASS | None; the card uses the owner's photo. |

## Block 3: Liveliness

| Check | Result |
|---|---|
| Dials declared | YES: ENERGY 3 / RHYTHM 3 / MOTION 2 |
| Output matches dials | YES: every section has a different composition (statement + evidence column, sized tickets, sticky heading + list, timeline rail, typographic lists, dark pass) |
| One focal point per screen | YES: headline + card, the About statement, the lead ticket, the section headings |
| Structural whitespace | YES: section spacing varies (96 to 112 px desktop, 64 to 72 px mobile) |
| One deliberate accent | YES: headline second half, "Live", the card number, the dot in the logo and "pass." |
| Identity motif | YES: the perforation (section dividers, ticket stubs, the contact pass) |
| Design Read declared | YES: top of this file |

## Block 4: Craftsmanship & Quality Locks

| Check | Result |
|---|---|
| C-1 intentionality | PASS: reasons in `DESIGN.md` and in code comments at each layout decision |
| C-2 functional completeness | PASS: see click-through |
| C-3 content-driven sections | PASS: every section maps to real material (bio, repos, papers, LinkedIn history, certificates) |
| C-4 resilience | PASS: loading and failure states for the card, 375 / 820 / 1280 checked, keyboard-only checked |
| C-5 evidence | PASS: every figure links to a source |
| R-05 template layout | PASS: no feature grid, no logo bar, no 3-step block, no 4-column footer |
| R-11 radius | PASS: 6 px controls, 14 px tickets, 22 px pass; no pills |
| R-15 CTAs | PASS: "See my projects", "Email me", "Open the live site", "Read the paper" |
| R-16 buzzwords | PASS: "Showcase" and "Journey" removed |
| R-20 identity | PASS: the lanyard, tickets and perforation belong to this site |
| R-21 dark mode | PASS: light by owner decision; dark is used only for the pass, by meaning |
| R-29 palette | PASS: paper, ink, one accent (two shades for contrast) |
| R-30 clone | PASS: the lanyard idea came from the owner's reference reel; the layout is original |
| R-31 reasons | PASS: see the reason column above |

## Not verifiable in the test browser

- Clipboard success message (clipboard permission denied there).
- Idle sway (the test browser reports reduced motion, so sway is off by design).
- Real touch dragging on a phone (`touch-action: pan-y` plus cancelling `touchmove` while dragging, verified by code inspection only).

## Addendum: follow-up fixes (same day)

| Change | Check |
|---|---|
| Name is the `h1` above the tagline | Desktop: first line of the hero. Mobile 375 px: top at 590 px, inside the first screen (812 px). |
| Static poster card, 3D loads after `load` + idle | Poster overlaid at 50% on the settled 3D card: no double edges. Main bundle 79 KB gzip; the 3D chunk no longer gates the first paint. drei removed (3D chunk 1,126 to 1,107 KB gzip). |
| About trimmed | Research explanation moved to the Research heading; "Right now" keeps the two items found nowhere else. |
| Absolute `og:url` / `og:image` | Build without a domain: `og:url` dropped, image relative. With `SITE_URL` or Vercel's `VERCEL_PROJECT_PRODUCTION_URL`: absolute URLs. |
| Repository count from the GitHub API at build | Build inlined 32, API reports 32; falls back to 32 offline with a warning. |

Re-run: `tsc -b` and `vite build` pass, no console errors on a fresh load, no horizontal overflow at 375 px, no em dash in source.
