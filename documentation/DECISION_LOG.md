# ARIA Personal — Decision Log

---

## DEC-001 — Shared backend vs separate backend
**Date:** 2026-03-18
**Decision:** Share the aria-advisor Render + Supabase backend
**Rationale:** Reuses simulation engine, goal/portfolio models, and Claude AI integration with zero duplication. Cheaper to run (no extra Render service). Personal users are isolated via `personal_user_id` FK on all shared tables.
**Trade-off accepted:** Tighter coupling — if aria-advisor backend is down, aria-personal is also down. Acceptable for v1.

## DEC-002 — Reuse existing Portfolio/Goal/LifeEvent tables vs new tables
**Date:** 2026-03-18
**Decision:** Reuse existing tables, add nullable `personal_user_id` FK
**Rationale:** No code duplication, no schema divergence. Advisor rows have `client_id` set; personal rows have `personal_user_id` set. Startup migration is additive and idempotent.
**Trade-off accepted:** Slightly more complex queries (filter by personal_user_id OR client_id). Acceptable at this scale.

## DEC-003 — JWT auth for personal users
**Date:** 2026-03-18
**Decision:** JWT with HS256, 7-day TTL, stored in localStorage
**Rationale:** Consistent with advisor app localStorage pattern. Consumer finance tracker, not banking — XSS risk acceptable. Simple to implement.
**Future:** Upgrade to httpOnly cookies + refresh tokens if 2FA or transaction features are added.

## DEC-004 — Separate repo (aria-personal) vs monorepo
**Date:** 2026-03-18
**Decision:** Separate repo
**Rationale:** Clean product separation, independent Vercel deployments, no risk of advisor app coupling in frontend. Different UX paradigms (consumer vs advisor) are better served by separate codebases.
