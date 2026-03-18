import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LayoutDashboard, Target, CalendarHeart, MessageSquare, LogOut } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/life-events', label: 'Life Events', icon: CalendarHeart },
  { to: '/copilot', label: 'Ask ARIA', icon: MessageSquare },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-navy-950 text-white min-h-screen flex-shrink-0">
        <div className="px-5 py-6 border-b border-navy-800">
          <div className="text-xs font-bold text-navy-300 tracking-widest uppercase mb-0.5">ARIA</div>
          <div className="text-sm font-semibold text-white">Personal Finance</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6 border-t border-navy-800 pt-4">
          <div className="px-3 mb-3">
            <div className="text-xs text-navy-400">Signed in as</div>
            <div className="text-xs font-semibold text-white truncate">{user?.display_name}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden bg-navy-950 text-white px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-navy-300 tracking-widest uppercase leading-none">ARIA</div>
            <div className="text-sm font-semibold">Personal Finance</div>
          </div>
          <button onClick={handleLogout} className="text-navy-300 hover:text-white transition-colors" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-navy-700' : 'text-gray-400'
                }`
              }
            >
              <Icon size={20} className="mb-0.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="md:hidden h-16" /> {/* spacer for mobile bottom nav */}
      </main>
    </div>
  )
}
