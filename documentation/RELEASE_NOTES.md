# ARIA Personal — Release Notes

---

## v0.1.0 — 2026-03-18 (Session 1)

**Initial build.**

### What's in v0.1.0
- User registration + login (JWT auth, email + password)
- Dashboard: portfolio summary, allocation chart, donut chart by fund category, urgent goals flag
- Goals: CRUD, Monte Carlo probability ring, What-if Scenario v2 (Mode 1 + Mode 2, inflation-adjusted)
- Life Events: CRUD with emoji-labeled types
- Ask ARIA: consumer-tone copilot with portfolio + goal + life event context
- Mobile-first layout: sidebar nav (desktop), bottom nav (mobile)

### Backend additions (in aria-advisor repo)
- `PersonalUser` + `PersonalCopilotLog` models
- JWT auth (`python-jose`, `passlib`)
- 5 new routers: `/personal/auth`, `/personal/portfolio`, `/personal/goals`, `/personal/life-events`, `/personal/copilot`
- Migrations: `personal_user_id` nullable FK on portfolios, goals, life_events

### Known gaps (next session)
- Portfolio edit page not built — Dashboard shows empty state but user can't add holdings from the UI yet
- Onboarding risk questionnaire not built
- Not yet deployed to Vercel (env vars pending)
