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

### Trades

#### Initiate Your Own Trade
Click **New Trade** on your dashboard (always visible — no advisor required).

- Select **Buy** or **Sell**
- Choose asset type (stock, mutual fund, crypto, bond, commodity, forex)
- Enter asset code, quantity, and estimated value
- Add an optional note
- Click **Submit Trade** — trade settles immediately

**Balance rules:**
- **Buy:** Requires sufficient cash balance (shown as "💵 Cash available" on dashboard)
- **Sell:** Requires sufficient units held for the specific asset

If an advisor is linked, they'll receive an informational notification. If no advisor is linked, the trade processes silently.

#### Advisor-Initiated Trades
When linked to an advisor, you'll also see trade approval requests on your dashboard.

**Status Flow:**
1. **📝 Draft** — Advisor is preparing the trade (hidden from you)
2. **⏳ Pending Approval** — Advisor submitted for your review
   - Shows in **Trades** section on dashboard
   - Review the trade: asset, quantity, estimated value
   - Click **Check & Approve** — balance check runs first
   - If balance is insufficient, a ⚠️ warning shows the shortfall amount
   - Adjust your trade or add funds, then re-attempt
3. **✅ Approved** — You approved, advisor will process
   - For mutual funds: advisor processes in 1-2 business days
   - For crypto: after approval, you execute on your exchange (Coinbase/Kraken/MetaMask)
4. **🔒 Settled** — Trade executed and completed
5. **❌ Rejected** — You rejected; advisor will follow up

**Notifications:**
- Desktop: notification banner appears when new trade is submitted
- Mobile: same banner
- No email notifications yet (coming in future update)

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

### v0.4.0 (2026-04-04)
- **Instrument Dropdown — Trade Modal:** Replaced free-text entry with a searchable instrument dropdown
  - 30 instruments: 10 NIFTY stocks + 20 MFs (equity index, debt, money market) + BTC + ETH
  - Buy: full list; sell: filtered to instruments you actually hold
  - Toggle between **By Amount (₹)** and **By Units** — other field auto-fills using NAV
  - Sell validation: blocks if quantity exceeds units held
  - Minimum quantities: crypto 0.0001 units, stocks 1 unit (whole shares only)
- **Live Price Refresh:** Your portfolio NAVs are refreshed from live sources every time you open the dashboard
  - Mutual funds: AMFI India (official daily NAVs)
  - Bitcoin & Ethereum: CoinGecko (real-time INR)
  - Stocks: NSE via Yahoo Finance feed
  - 5-minute cache prevents repeated API calls
- **Starter Portfolio:** All new accounts now start with a default portfolio
  - 10 NIFTY stocks + 10 MFs + 5 BTC + 5 ETH + ₹5L cash balance

### v0.3.0 (2026-04-03)
- **Client-Initiated Trades:** New Trade button always visible — initiate your own trades without an advisor
  - Buy/Sell toggle, asset type + code, quantity + value
  - Trades settle immediately
  - Advisor notified (if linked) as information — no approval loop
- **Balance Validation:** Check & Approve now runs a balance check before settling advisor trades
  - Buy: checks cash balance
  - Sell: checks units held for the specific asset
  - Inline ⚠️ shortfall warning with exact amount needed
- **Cash Balance Display:** "💵 Cash available: ₹X" shown under portfolio total on dashboard

### v0.2.0 (2026-03-28)
- **Trade Approval Workflow:** Advisor can submit trades for client approval
  - Dashboard shows all trade statuses: Draft, Pending Approval, Approved, Settled, Rejected
  - Notifications banner alerts when new trade is submitted
  - Approve/Reject buttons for pending trades
  - Support for mutual funds + crypto (crypto requires manual exchange execution)

### v0.1.0 (2026-03-18)
- Initial build: Register/Login, Dashboard, Goals, Life Events, Ask ARIA
- JWT auth, shared backend with ARIA advisor
- What-if Scenario v2 (inflation-adjusted, Mode 1 + Mode 2)
- Mobile-first responsive layout
