'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Timer, Trophy, User, LogOut } from 'lucide-react'
import { logout, getCurrentUser } from '@/lib/auth'
import NotificationBell from '@/components/notifications/NotificationBell';

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getCurrentUser()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    {
      name: 'Timer',
      path: '/timer',
      icon: Timer,
    },
    {
      name: 'Arena',
      path: '/arena',
      icon: Trophy,
    },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Cerrar dropdown al hacer click fuera
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
    <nav className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-200 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <span className="text-xl font-bold text-navy">Pick & Pack</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 🔔 Aquí va la campanita */}
            <NotificationBell />
            
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-navy text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {item.name}
                  </span>
                </Link>
              )
            })}

            {/* Avatar con menú desplegable */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative"
              >
                <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-gold hover:border-gold-dark transition-all cursor-pointer">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Indicador de online */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 overflow-hidden">
                  {/* Header del dropdown */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  </div>
                  
                  {/* Opciones */}
                  <div className="py-2">
                    <Link
                      href="/perfil"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Ver Perfil</span>
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