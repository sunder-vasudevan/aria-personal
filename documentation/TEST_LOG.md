# ARIA Personal — Test Log

---

## Session 1 — 2026-03-18

### Manual test plan (post-deploy)
- [ ] POST /personal/auth/register → 201 + token
- [ ] POST /personal/auth/login → 200 + token
- [ ] GET /personal/auth/me with Bearer token → user object
- [ ] POST /personal/portfolio → 201, GET → same data
- [ ] POST /personal/goals → 201 with probability_pct
- [ ] GET /personal/goals/projection?inflation_rate=0.06 → real_target, required_sip
- [ ] POST /personal/life-events → 201
- [ ] POST /personal/copilot → response contains "your" (consumer tone check)
- [ ] GET /clients (advisor endpoint) → unaffected after migration

### Frontend smoke tests
- [ ] Register → redirects to dashboard
- [ ] Login with wrong password → error shown
- [ ] Dashboard: empty portfolio shows CTA
- [ ] Goals page: add goal → card appears with probability ring
- [ ] What-if panel: slider move → auto-updates after 500ms
- [ ] Mode 2: required SIP shown vs current SIP gap
- [ ] Life Events: add event → appears in list
- [ ] Copilot: send message → ARIA responds in first person
- [ ] Sign out → redirects to /login
- [ ] Mobile: bottom nav visible and functional
