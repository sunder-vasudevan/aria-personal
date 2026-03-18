# ARIA Personal — Claude Instructions

## Project
Consumer personal finance app. Self-directed users, no advisor. Shared backend with aria-advisor.

## Standing Rules
- Never add `Co-Authored-By` to any git commit
- HELP.md updated for every new feature
- NOTES.md updated at every session wrap
- Version bumped on every release
- Mobile-first: all UI must work on phone

## Stack
- Frontend: React 18 + Vite + Tailwind CSS (navy palette)
- Backend: Shared FastAPI at ~/Daytona/aria-advisor/backend/
- Auth: JWT stored as `aria_personal_token` in localStorage
- API prefix: `/personal/` for all personal user routes

## Tone
Consumer-facing. ARIA speaks in first person to the user: "your portfolio", "you hold", never "the client".

## Key files
- `src/api/personal.js` — all API calls
- `src/auth/useAuth.js` — auth context
- `src/pages/` — all page components
- `~/Daytona/aria-advisor/backend/app/routers/personal_*.py` — backend routers
