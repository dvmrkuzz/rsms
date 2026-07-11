import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, Megaphone, MessageCircle, Search, Menu, X } from 'lucide-react'
import logo from '../assets/logo.png'
import ChatWidget from './ChatWidget'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/assistant', label: 'Assistant', icon: MessageCircle },
  { to: '/track', label: 'Track', icon: Search },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F3F4F6' }}>

      {/* Gold top accent */}
      <div className="h-1 w-full shrink-0"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="SorSU"
              className="w-9 h-9 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <p className="font-extrabold text-xs leading-tight tracking-wide"
                style={{ color: '#7B1113' }}>
                SORSOGON STATE UNIVERSITY
              </p>
              <p className="text-xs font-semibold leading-tight hidden sm:block"
                style={{ color: '#C9A84C' }}>
                BULAN CAMPUS — REGISTRAR'S OFFICE
              </p>
              <p className="text-xs font-semibold leading-tight sm:hidden"
                style={{ color: '#C9A84C' }}>
                REGISTRAR'S OFFICE
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                style={({ isActive }) => isActive ? { background: '#7B1113' } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            style={{ color: '#7B1113' }}
          >
            {mobileMenuOpen
              ? <X className="w-6 h-6" />
              : <Menu className="w-6 h-6" />
            }
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                style={({ isActive }) => isActive ? { background: '#7B1113' } : {}}
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Page content — full width */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-5 text-center mt-8">
        <div className="h-0.5 w-20 mx-auto mb-3 rounded"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />
        <p className="text-sm font-semibold" style={{ color: '#7B1113' }}>
          Sorsogon State University — Bulan Campus
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Registrar's Office © {new Date().getFullYear()}
        </p>
      </footer>

      {/* Bottom gold accent */}
      <div className="h-1 w-full shrink-0"
        style={{ background: 'linear-gradient(90deg, #C9A84C, #F0D080, #C9A84C)' }} />

      <ChatWidget />
    </div>
  )
}