import { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  UserPlus,
  LayoutDashboard,
  Target,
  Heart,
  MessageSquare,
  Sliders,
  LogOut,
  AlertCircle,
  History,
} from 'lucide-react'

const sections = [
  {
    id: 'getting-started',
    icon: <UserPlus size={18} />,
    title: 'Getting Started',
    content: [
      {
        heading: 'Create an Account',
        text: 'Go to /register. Enter your name, email, and a password (8+ characters). You\'ll land on your dashboard immediately.',
      },
      {
        heading: 'Sign In',
        text: 'Go to /login and enter your email and password. Sessions last 7 days — you\'ll be prompted to sign in again when it expires.',
      },
    ],
  },
  {
    id: 'dashboard',
    icon: <LayoutDashboard size={18} />,
    title: 'Portfolio Dashboard',
    content: [
      {
        heading: 'Adding your portfolio',
        text: 'Click Add Portfolio on the dashboard to enter your mutual fund holdings — fund name, category, amount, and target allocation %.',
      },
      {
        heading: 'Donut chart',
        text: 'Shows your current fund allocation by category. Each segment is colour-coded. Click a segment to highlight it.',
      },
      {
        heading: 'Allocation bars',
        text: 'Shows current vs target allocation for each category (Equity, Debt, Cash). A drift warning appears when you\'re more than 5% off target.',
      },
      {
        heading: 'Urgent goals',
        text: 'Goals that are behind schedule or low probability are flagged on your dashboard so you can act quickly.',
      },
    ],
  },
  {
    id: 'goals',
    icon: <Target size={18} />,
    title: 'Goals',
    content: [
      {
        heading: 'Adding a goal',
        text: 'Click Add Goal. Enter a name (e.g. "Retirement"), target amount (₹), target date, and monthly SIP. ARIA calculates the probability of reaching it.',
      },
      {
        heading: 'Probability ring',
        text: 'Each goal shows a circular probability ring — green (high), amber (medium), red (low). The % is your Monte Carlo success rate.',
      },
      {
        heading: 'Editing and deleting',
        text: 'Click the edit icon on any goal card to update details. Probability recalculates automatically. Delete with two-step confirm to avoid accidents.',
      },
    ],
  },
  {
    id: 'what-if',
    icon: <Sliders size={18} />,
    title: 'What-if Goal Scenario',
    content: [
      {
        heading: 'Where to find it',
        text: 'Goals page → expand the What-if Scenario panel.',
      },
      {
        heading: 'Mode 1 — Will I achieve it?',
        text: 'Adjust monthly SIP delta, assumed return (6–18%), timeline shift (-2 to +5 years), and inflation rate (3–10%). Probabilities update automatically as you move the sliders (500ms debounce). Each goal shows projected probability, inflation-adjusted target, and median corpus in future ₹ and today\'s ₹.',
      },
      {
        heading: 'Mode 2 — What SIP do I need?',
        text: 'Shows the monthly SIP required for 80% probability of success. Compares required vs current SIP with a gap or surplus.',
      },
      {
        heading: 'How the simulation works',
        text: '1,000 Monte Carlo paths per goal. Returns vary with ±5% annualised volatility around the assumed rate. The target is inflated to future value before counting successes.',
      },
    ],
  },
  {
    id: 'life-events',
    icon: <Heart size={18} />,
    title: 'Life Events',
    content: [
      {
        heading: 'What to log',
        text: 'Job change, marriage, new child, inheritance, home purchase, medical event, or any major financial milestone.',
      },
      {
        heading: 'How ARIA uses them',
        text: 'ARIA references your life events in Copilot conversations to give you context-aware advice. For example, if you logged a job change, ARIA can factor in income changes when discussing your SIP.',
      },
      {
        heading: 'Adding and editing',
        text: 'Click Log Event to add a new entry. Click the edit icon on any event to update it. Delete with two-step confirm.',
      },
    ],
  },
  {
    id: 'copilot',
    icon: <MessageSquare size={18} />,
    title: 'Ask ARIA (Copilot)',
    content: [
      {
        heading: 'What ARIA knows',
        text: 'Your full portfolio, all goals, and all life events. ARIA speaks directly to you ("your portfolio", "you hold") — not in advisor third-person.',
      },
      {
        heading: 'Sample questions',
        text: '"Am I on track for retirement?" / "How much more SIP do I need for my house goal?" / "What does my portfolio drift mean?" / "Should I rebalance given my recent job change?"',
      },
      {
        heading: 'Chat history',
        text: 'Conversation history is maintained within the session.',
      },
    ],
  },
  {
    id: 'account',
    icon: <LogOut size={18} />,
    title: 'Account',
    content: [
      {
        heading: 'Signing out',
        text: 'Click Sign Out in the sidebar (desktop) or the logout icon in the top bar (mobile).',
      },
      {
        heading: 'Profile editing',
        text: 'Name and email editing coming in a future update.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    icon: <AlertCircle size={18} />,
    title: 'Troubleshooting',
    content: [
      {
        heading: '"Invalid or expired token"',
        text: 'Your session has expired (7 days). Sign in again.',
      },
      {
        heading: 'Copilot not responding',
        text: 'The backend API key may be unavailable. Try again in a few minutes or contact support.',
      },
      {
        heading: 'Portfolio not showing',
        text: 'You haven\'t added your portfolio yet. Click Add Portfolio on the dashboard.',
      },
      {
        heading: 'Goals show 0% probability',
        text: 'Your target date may be in the past. Click edit on the goal and update the target date.',
      },
    ],
  },
  {
    id: 'changelog',
    icon: <History size={18} />,
    title: 'Version History',
    content: [
      {
        heading: 'v0.1.0 (2026-03-18)',
        text: 'Initial build: Register/Login, Dashboard, Goals, Life Events, Ask ARIA. JWT auth. What-if Scenario v2 (inflation-adjusted, Mode 1 + Mode 2). Mobile-first responsive layout.',
      },
    ],
  },
]

function SectionCard({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600">{section.icon}</span>
          <span className="text-sm font-semibold text-gray-900">{section.title}</span>
        </div>
        {open
          ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 space-y-4 border-t border-gray-100">
          {section.content.map((item) => (
            <div key={item.heading} className="pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">{item.heading}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Help() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <HelpCircle size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Guide</h1>
          <p className="text-sm text-gray-500">ARIA Personal — click any section to expand</p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['Getting Started', 'Dashboard', 'Goals', 'What-if', 'Life Events', 'Ask ARIA', 'Account'].map((label) => (
          <span key={label} className="px-2.5 py-1 rounded-full border border-gray-200 text-xs text-gray-600 bg-white">
            {label}
          </span>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        ARIA Personal v0.1.0 · Built with ❤️ from Hyderabad
      </p>
    </div>
  )
}
