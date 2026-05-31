import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, UserCheck,
  Megaphone, ClipboardList, LogOut, Menu, X,
  GraduationCap, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/requests', label: 'Service Requests', icon: FileText },
  { to: '/dashboard/visitors', label: 'Visitors', icon: UserCheck },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/dashboard/audit', label: 'Audit Logs', icon: ClipboardList },
]

export default function DashboardLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white flex flex-col transition-all duration-200 shrink-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-800">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-900" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold leading-tight">SorSU Bulan</p>
              <p className="text-xs text-blue-300 leading-tight">Registrar</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white font-medium'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-blue-800 p-3">
          {sidebarOpen && user && (
            <div className="px-2 py-2 mb-2">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-blue-300 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Registrar</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">Dashboard</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}