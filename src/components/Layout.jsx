import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LayoutDashboard, Target, CalendarHeart, MessageSquare, LogOut, HelpCircle } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/life-events', label: 'Life Events', icon: CalendarHeart },
  { to: '/copilot', label: 'Ask ARIA', icon: MessageSquare },
  { to: '/help', label: 'Help', icon: HelpCircle },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Frosted top bar — all viewports ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold text-[#1D6FDB] tracking-widest uppercase">ARIA</span>
          <span className="hidden md:block text-xs text-gray-400">Personal Finance</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#1D6FDB]'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right: user + logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden md:block text-xs text-gray-500 max-w-[120px] truncate">
            {user?.display_name}
          </span>
          <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1D6FDB] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {(user?.display_name || 'U')[0].toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full pb-20 md:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex z-40">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-[#1D6FDB]' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} className="mb-0.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
