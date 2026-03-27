# ARIA Personal — Session Wrap Trigger

Run this at the end of every ARIA Personal session, before the global session_wrap.md steps.

---

## Step 1 — Version bump
- Increment `NOTES.md` version (patch for fixes, minor for features, major for rewrites)
- Update stack table if any dependency changed

## Step 2 — Docs
- `documentation/RELEASE_NOTES.md` — add new version entry (date, features, stack changes)
- `NOTES.md` — update "What Shipped This Session", "Next Feature ← START HERE", "Open Flags"
- `documentation/DECISION_LOG.md` — log any non-obvious design/tech decisions (DECISION-XXX format)
- `documentation/TEST_LOG.md` — log test results

## Step 3 — Read-after-write check (after any API/DB change)
- Verify auth flow end-to-end (register → login → dashboard)
- Verify any new API routes return correct data

## Step 4 — Git
```bash
cd ~/Daytona/aria-personal
git add -A
git status
git commit -m "wrap: session N — [summary]"
git push origin main
```

## Step 5 — Vercel deploy (if changes shipped)
```bash
cd ~/Daytona/aria-personal
vercel --prod
```

## Step 6 — Update project memory
Update `~/claude-memory/memory/project_aria_personal.md` with current state.
