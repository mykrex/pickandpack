'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Timer, Trophy, User } from 'lucide-react'

export function TopNav() {
  const pathname = usePathname()

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
    {
      name: 'Perfil',
      path: '/perfil',
      icon: User,
    },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-200 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <span className="text-xl font-bold text-navy">Pick & Pack</span>
          </div>

          {/* Navigation items */}
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
          </div>
        </div>
      </div>
    </nav>
  )
}