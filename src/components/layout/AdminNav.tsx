'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, User, LogOut } from 'lucide-react'
import { logout, getCurrentUser } from '@/lib/auth'

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getCurrentUser()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Usuarios',
      path: '/admin/usuarios',
      icon: Users,
    },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-navy border-b-2 border-navy-light shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white">Turbo Trolly</span>
              <span className="text-xs text-gold-light block leading-none">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white text-navy'
                        : 'text-white hover:bg-navy-light'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative"
              >
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-navy font-bold text-lg border-4 border-gold-light hover:border-white transition-all cursor-pointer">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-navy"></div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gold-light">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-navy">{user?.name}</p>
                      <span className="text-xs bg-navy text-white px-2 py-0.5 rounded-full font-semibold">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 truncate">{user?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Mi Dashboard</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}