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

## Session 2 — 2026-03-20 (Design Review)

### What happened
- Reviewed reference mockup (Material Design / blue palette)
- Built `aria-personal-preview.html` (V1) on Desktop — static HTML preview
- Built `aria-personal-preview-v2.html` (Before/After comparison) on Desktop
- V2 direction **approved** — changes to apply to both Personal and Advisor
- V2 flagged as **too cluttered** — V3 pass needed (more whitespace, less density)
- Created `PLAN.md` to track feature backlog and design decisions

### Decisions made
- Help → header icon button (beside notifications), removed from bottom nav
- Mobile bottom nav: 4 tabs only (Dashboard, Goals, Life, Ask ARIA)
- Hero: greeting + status pills replace redundant tagline
- Goals cards: progress bars, not just % number
- ARIA Says card: dark gradient to signal AI intelligence layer
- Allocation bars: target marker + deviation pill
- Light/dark toggle: added to backlog (PLAN.md)
- Personal ↔ Advisor share design system — always confirm before cross-applying changes

### Parked
- V3 mockup (declutter pass) — next design session

## Session 3 (2026-03-28) — Trade Notifications Integration

### What Shipped
- **FEAT: Trade Approval Notifications** ✅
  - Backend: Shared with aria-advisor (trade_submitted, trade_approved, trade_rejected notifications)
  - Frontend: Dashboard now fetches + displays trade notifications via alert banner
  - UI: Trade status colors (pending=yellow, approved=green, rejected=red, settled=blue)
  - Issue fixed: Joshua's notifications now display (portfolio link validation added to backend)
- **HELP.md updated** — Trade Approval flow documented from client perspective (v0.2.0)

### Open Flags
- E2E test for trade workflow not yet written (Layer 3 in prevention strategy)
- Unit test fixture for linked_client_and_personal_user not yet created (Layer 2)
- Full advisor → client workflow manual test done, automated test pending

## What Shipped (2026-04-25 — Session 42) — Security: Cookie Auth ✅

- `src/api/personal.js`: `withCredentials: true`; localStorage token interceptor removed; `logoutApi()` added; `refreshMyPrices(uid)` takes uid param
- `src/auth/useAuth.jsx`: `useEffect` calls `getMe()` unconditionally (cookie determines auth state); login/register no longer store token; logout calls `logoutApi()` + server cookie cleared
- `Dashboard.jsx`: `refreshMyPrices(user?.id)` — uid from auth context, not localStorage
- **Commit:** 20dfb94 — pushed to origin

## ← START HERE NEXT SESSION
- **Verify** KYC doc upload returns 200 (not 503) — prod test after Render redeploy
- **ARIA Personal Dashboard revamp**: KPI bar, section reorder, goal probability bars — plan confirmed, not built
- **FEAT-503** (aria-advisor): Live goal probability on sliders

---

## Next Session Agenda ← (superseded — see above)

### 1. Layer 2: Test Fixture — linked_client_and_personal_user
- Create pytest fixture enforcing two-way portfolio/client linking
- Use for all future trade notification tests

### 2. Layer 3: E2E Test — Full Trade Workflow
- Test: Advisor creates trade → submits → client sees notification → approves
- Cover both happy path + rejection flow

### 3. FEAT-P001 — Portfolio Add/Edit UI
- Dashboard currently shows empty state for portfolio — user needs a way to add holdings
- Build `/portfolio/edit` page with fund selector, allocation inputs, save flow

### 4. FEAT-P002 — Onboarding flow
- After register → risk questionnaire (5 questions) → redirect to dashboard
- Sets risk_score + risk_category on PersonalUser

## What Shipped This Session (2026-04-04 — Session 16)

### Instrument Dropdown — Trade Modal ✅
- 30 instruments (10 stocks + 20 MFs + BTC + ETH) replace free-text entry
- Sell: filtered to held instruments; validates against units_held
- Buy: full list + amount↔units NAV auto-calc (By Amount / By Units toggle)
- Min qty: crypto 0.0001, stocks 1 unit — frontend inline error + backend 400

### Live Price Refresh ✅
- `refreshMyPrices()` fires before portfolio render on Dashboard load
- Sources: AMFI (MFs), CoinGecko (BTC/ETH INR), yfinance NSE (stocks)
- 5-min in-process cache on backend; portfolio total_value auto-updated

### Starter Portfolio Seed ✅
- All new signups get: 10 stocks + 10 MFs + 5 BTC + 5 ETH + ₹5L cash
- Kate and Ruben backfilled on next backend restart

## Security Parking Lot (2026-04-18)
- **NOW — N1:** Audit every FastAPI `/personal/` route: verify `current_user.id == resource.personal_user_id` on portfolio, goals, life-events, trade endpoints (IDOR)
- **NOW — N2:** Strip cross-user data from Copilot system prompt — never co-mingle context between users
- **IMMEDIATE — I1:** Move JWT (`aria_personal_token`) from localStorage → `httpOnly` cookie
- **IMMEDIATE — I2:** Copilot output filter — refuse to echo env vars or system prompt content
- **IMMEDIATE — I6:** Confirm Supabase service role key is never in frontend bundle
- **LATER — L1:** Add Supabase RLS as defence-in-depth
- **LATER — L3:** Pin all dependency versions; add Snyk/npm audit to CI
- **LATER — L7:** Write SECURITY.md

## Next Session Agenda
- FEAT-P001 Portfolio Add/Edit UI (still pending)
- FEAT-P002 Onboarding risk questionnaire (still pending)
- FEAT-2005 Trade Compliance (consent + risk warning modals)
