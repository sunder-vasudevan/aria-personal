# ARIA Personal — Feature Plan

## Status
v0.1.0 shipped. Pending Vercel deploy.

---

## Backlog

### UI / Design

- [ ] **Light / Dark mode toggle** — Add a theme toggle icon button to the top-right header (beside help and notifications). Persist preference in localStorage. Tailwind `darkMode: "class"` is already configured.

### Navigation

- [ ] Help page — mirror the Help page from ARIA Advisor, adapted for Personal (consumer tone). Route: `/help`. Add `help_outline` icon button to header (top-right, beside notifications).

### Features

- [ ] Goals page — create, edit, track goals with progress bars
- [ ] Life Events page — major financial life events (marriage, home, child, retirement)
- [ ] Ask ARIA page — conversational AI interface

---

## Design — In Progress

- V2 mockup (`aria-personal-preview-v2.html`) direction approved but **too cluttered**.
- Next iteration: reduce density, add more whitespace, simplify card layouts before locking.
- Changes confirmed to apply to **both Personal and Advisor** — always confirm with Sunny Hayes before cross-applying.

## Design Decisions (locked)

- Header: Logo · Desktop nav · [help_outline icon] [notifications icon] [avatar] — no Help tab in nav
- Mobile bottom nav: Dashboard · Goals · Life · Ask ARIA (4 tabs only, Help is header icon)
- Hero: greeting + status pills, no redundant tagline
- ARIA Says card: dark gradient to signal AI intelligence layer
- Goals cards: show progress bars, not just % number
- Allocation bars: show target marker + deviation pill

---

## Notes

- All projects live in `~/Daytona/`
- Shared backend with ARIA Advisor at `~/Daytona/aria-advisor/backend/`
