'use client'

import { useState, useEffect } from 'react'
import { TopNav } from '@/components/layout/TopNav'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { UserCard } from './components/UserCard'
import { StatsGrid } from './components/StatsGrid'
import { BadgesList } from './components/BadgesList'

const mockStats = {
  avgTime: '3:45 min',
  trolleysPerFlight: 8,
  weeklyTrolleys: 156,
  bestTime: '2:30 min',
  totalFlights: 234,
  efficiency: 94,
}

const mockBadges = [
  {
    id: 1,
    icon: '🎉',
    title: 'Primer Día',
    description: 'Completaste tu primer día',
    earned: true,
    earnedDate: '15 Oct 2024',
  },
  {
    id: 2,
    icon: '⚡',
    title: 'Velocista',
    description: 'Completa un trolley en menos de 3 min',
    earned: true,
    earnedDate: '18 Oct 2024',
  },
  {
    id: 3,
    icon: '🔥',
    title: 'Racha de Fuego',
    description: '7 días consecutivos trabajando',
    earned: true,
    earnedDate: '22 Oct 2024',
  },
  {
    id: 4,
    icon: '💯',
    title: 'Perfeccionista',
    description: 'Sin errores en 50 trolleys',
    earned: true,
    earnedDate: '24 Oct 2024',
  },
  {
    id: 5,
    icon: '🚀',
    title: 'Cohete',
    description: '100 trolleys completados',
    earned: false,
  },
  {
    id: 6,
    icon: '👑',
    title: 'Maestro',
    description: '500 trolleys completados',
    earned: false,
  },
  {
    id: 7,
    icon: '🌟',
    title: 'Estrella',
    description: 'Mejor tiempo del mes',
    earned: false,
  },
  {
    id: 8,
    icon: '🎯',
    title: 'Preciso',
    description: '95% de precisión en 100 trolleys',
    earned: false,
  },
]

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const currentUser = getCurrentUser()

  useEffect(() => {
    async function fetchUser() {
      try {
        if (!currentUser) return

        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (error) throw error
        setUser(data)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [currentUser])

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-gray-50 p-4 pt-20">
          <div className="max-w-6xl mx-auto pt-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNav />
      
      <main className="min-h-screen bg-gray-50 p-4 pt-20">
        <div className="max-w-6xl mx-auto pt-8">
          {user && <UserCard user={user} />}
          <StatsGrid stats={mockStats} />
          <BadgesList badges={mockBadges} />
        </div>
      </main>
    </>
  )
}