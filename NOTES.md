# ARIA Personal — Session Notes

> *"Your money, your decisions — with intelligence behind every one."*

## Current State
**Phase:** 1 — MVP Build 🔶 IN PROGRESS
**Version:** v0.1.0
**Repo:** https://github.com/sunder-vasudevan/aria-personal
**Local:** `~/Daytona/aria-personal`
**Backend:** Shared with aria-advisor — https://aria-advisor.onrender.com
**Mobile:** ✅ Fully responsive (mobile-first design)

## Stack
| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (shared with ARIA advisor) |
| Database | Supabase PostgreSQL (shared, personal_users table) |
| Auth | JWT (python-jose + passlib), 7-day tokens |
| Hosting | Vercel (frontend) + Render (backend, shared) |
| AI | Anthropic Claude Sonnet 4.6 |

## Architecture Decision
**ARIA Personal uses the shared aria-advisor backend** — same Render service, same Supabase DB.
- New `personal_users` table for user accounts
- `personal_user_id` FK added (nullable) to `portfolios`, `goals`, `life_events`
- Advisor-owned rows untouched (client_id set, personal_user_id = NULL)
- New routes under `/personal/` prefix with JWT auth

## What's Built (Session 1 — 2026-03-18)
- Backend: PersonalUser model, JWT auth, 5 routers (auth, portfolio, goals, life-events, copilot)
- Frontend: Full React app — Login, Register, Dashboard, Goals, Life Events, Ask ARIA (Copilot)
- What-if Goal Scenario v2 (Mode 1 + Mode 2, inflation-adjusted, debounced auto-run)
- Consumer-tone ARIA copilot ("your portfolio", not "the client")
- Mobile-first layout with sidebar (desktop) + bottom nav (mobile)

## Next Session Agenda ← START HERE NEXT SESSION

### 1. FEAT-P001 — Portfolio Add/Edit UI
- Dashboard currently shows empty state for portfolio — user needs a way to add holdings
- Build `/portfolio/edit` page with fund selector, allocation inputs, save flow
- Mirror ClientForm Tab 3 logic but consumer-facing

### 2. FEAT-P002 — Onboarding flow
- After register → risk questionnaire (5 questions) → redirect to dashboard
- Sets risk_score + risk_category on PersonalUser via PUT /personal/auth/profile

### 3. FEAT-P003 — Vercel deploy + env vars
- Deploy to Vercel, set VITE_API_URL
- Update Render: JWT_SECRET_KEY + PERSONAL_FRONTEND_URL

## Open Flags
- Portfolio edit page not built yet — Dashboard shows empty state but no way to add data
- JWT_SECRET_KEY needs to be set in Render env vars before auth will work in prod
- PERSONAL_FRONTEND_URL needs to be set in Render once Vercel URL is known
