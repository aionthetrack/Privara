import { Link, useLocation } from 'react-router-dom'
import { Shield, LayoutDashboard, ClipboardList, FileText, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/policies', label: 'Policies', icon: FileText },
]

export default function Navbar() {
  const { signOut, org } = useAuth()
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-base tracking-tight">Privara</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${pathname.startsWith(to)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {org && (
            <span className="hidden sm:block text-sm text-slate-500 truncate max-w-32">
              {org.name}
            </span>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden flex border-t border-slate-100">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors
              ${pathname.startsWith(to) ? 'text-indigo-600' : 'text-slate-500'}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
