import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, UserCheck, Megaphone, ClipboardList, HelpCircle, BarChart2, LogOut, Menu, X, ChevronRight, Monitor } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useDashboardAlerts } from '../../hooks/useDashboardAlerts'
import ToastStack from '../notifications/ToastStack'
import logo from '../../assets/logo.png'

const dailyTaskNavItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/counter', label: 'Counter', icon: Monitor },
  { to: '/dashboard/requests', label: 'Service Requests', icon: FileText },
  { to: '/dashboard/visitors', label: 'Visitors', icon: UserCheck },
  { to: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/dashboard/faqs', label: 'FAQs', icon: HelpCircle },
]

const adminNavItems = [
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/audit', label: 'Audit Logs', icon: ClipboardList },
]

export default function DashboardLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useDashboardAlerts()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ToastStack />

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col transition-all duration-200 shrink-0 relative`}
        style={{ background: 'linear-gradient(180deg, #7B1113 0%, #5a0d0e 100%)' }}
      >
        {/* Gold top accent */}
        <div className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
          <img
            src={logo}
            alt="SorSU"
            className="w-8 h-8 object-contain shrink-0 drop-shadow"
          />
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-extrabold leading-tight tracking-wide">SorSU Bulan</p>
              <p className="text-xs font-medium leading-tight" style={{ color: '#F0D080' }}>Registrar</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarOpen && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
              Daily Tasks
            </p>
          )}
          {dailyTaskNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              {sidebarOpen && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Administration
                </p>
              )}
              {adminNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span>{label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3 shrink-0">
          {sidebarOpen && user && (
            <div className="px-2 py-2 mb-2">
              <p className="text-white text-sm font-semibold truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs capitalize" style={{ color: '#F0D080' }}>{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Gold bottom accent */}
        <div className="h-1 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Registrar</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold" style={{ color: '#7B1113' }}>Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #7B1113, #A01515)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}