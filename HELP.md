# ARIA Personal — Help Guide

> *Your money, your decisions — with intelligence behind every one.*

---

## Overview

ARIA Personal is a self-directed personal finance tracker. No advisor needed — you manage your own portfolio, track goals, log life events, and chat with ARIA about your finances.

---

## Getting Started

### 1. Create an Account
Go to `/register`. Enter your name, email, and a password (8+ characters). You'll be taken straight to your dashboard.

### 2. Add Your Portfolio
From the dashboard, click **Add Portfolio** to enter your mutual fund holdings with allocation targets.

### 3. Set Goals
Go to **Goals** and click **Add Goal**. Enter a goal name (e.g. "Retirement"), target amount, target date, and monthly SIP. ARIA will calculate the probability of reaching it using Monte Carlo simulation.

### 4. Log Life Events
Go to **Life Events** to log major milestones — job change, marriage, new child, inheritance, etc. ARIA uses these for context in conversations.

### 5. Ask ARIA
Go to **Ask ARIA** and chat freely. ARIA knows your portfolio, goals, and life events and speaks directly to you ("your portfolio", "you hold").

---

## Features

### Portfolio Dashboard
- Donut chart showing fund allocation by category
- Allocation bars showing current vs target (equity, debt, cash)
- Drift warnings when you're more than 5% off target
- Urgent goals flagged on the dashboard

### What-if Goal Scenario
Expand the **What-if Scenario** panel on the Goals page.

**Mode 1 — Will I achieve it?**
- Adjust monthly SIP delta, assumed return rate (6–18%), timeline shift, and inflation rate
- Probabilities update automatically (500ms debounce after slider move)
- Each goal shows: projected probability, inflation-adjusted target, projected median corpus in future ₹ and today's ₹

**Mode 2 — What SIP do I need?**
- Shows the monthly SIP required for 80% probability of success
- Compares required vs current SIP with a gap (or surplus) display
- Adjust return rate and inflation to model different scenarios

> Simulation: 1,000 Monte Carlo paths per goal. Target is inflated to future value before counting successes. Returns vary with ±5% annualised volatility.

### ARIA Copilot
- Chat with ARIA about your finances in plain language
- ARIA knows your full portfolio, goals, and life events
- Conversation history maintained within the session
- Suggested questions to get started

---

## Account

### Changing Your Name
Profile editing coming in a future update.

### Signing Out
Click **Sign Out** in the sidebar (desktop) or the logout icon in the top bar (mobile).

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|-------------|-----|
| "Invalid or expired token" | Session expired after 7 days | Sign in again |
| Copilot not responding | Backend API key | Contact support |
| Portfolio not showing | Not added yet | Use Add Portfolio on dashboard |
| Goals show 0% probability | Target date in the past | Update target date |

---

## Version History

### v0.1.0 (2026-03-18)
- Initial build: Register/Login, Dashboard, Goals, Life Events, Ask ARIA
- JWT auth, shared backend with ARIA advisor
- What-if Scenario v2 (inflation-adjusted, Mode 1 + Mode 2)
- Mobile-first responsive layout
