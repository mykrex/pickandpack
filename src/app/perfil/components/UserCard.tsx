'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: number
  Name?: string
  name?: string
  email?: string
  role?: string
  joinDate?: string
  fecha_ingreso?: Date
  Region?: string
}

interface UserCardProps {
  user: User
  badgeCount?: number
}

export function UserCard({ user, badgeCount = 0 }: UserCardProps) {
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const { data, error } = await supabase
          .from('Users')
          .select('Name, Region, fecha_ingreso, correo')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setUserDetails(data)
        }
      } catch (err) {
        console.error('Error cargando detalles del usuario:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user.id) {
      fetchUserDetails()
    }
  }, [user.id])

  const formatJoinDate = () => {
    if (userDetails?.fecha_ingreso) {
      return new Date(userDetails.fecha_ingreso).toLocaleDateString('es-MX', {
        month: 'short',
        year: 'numeric',
      })
    }
    return 'Oct 2024'
  }

  const userName = userDetails?.Name || user.Name || user.name || 'Usuario'
  const userEmail = userDetails?.correo || user.email || `${userName?.toLowerCase().replace(/\s+/g, '.')}@pickandpack.com`
  const userRegion = userDetails?.Region || user.Region

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-100">
        <div className="animate-pulse flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-100">
      <div className="flex items-center space-x-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-gold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-7 h-7 rounded-full border-4 border-white"></div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-navy mb-1">
            {userName}
          </h1>
          <p className="text-gray-600 mb-2">
            {userEmail}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-navy text-white px-3 py-1 rounded-full font-medium">
              {user.role || 'Operador'}
            </span>
            {userRegion && (
              <span className="text-gray-500 flex items-center gap-1">
                📍 {userRegion}
              </span>
            )}
            <span className="text-gray-500">
              Miembro desde: {formatJoinDate()}
            </span>
          </div>
        </div>

        {/* Quick Stats - Badge Count */}
        <div className="text-center px-6 border-l-2 border-gray-200">
          <div className="text-3xl font-bold text-gold">{badgeCount}</div>
          <div className="text-sm text-gray-600 font-medium">Medallas</div>
        </div>
      </div>
    </div>
  )
}