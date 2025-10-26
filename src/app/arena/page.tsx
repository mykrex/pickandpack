'use client'

import { useEffect, useState } from 'react'
import { TopNav } from '@/components/layout/TopNav'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/auth'
import { BadgeGrid } from '@/components/ui/BadgeGrid'
import { Trophy, RefreshCw, Users } from 'lucide-react'
import type { User } from '@/types/database'
import type { Badge } from '@/types/badges'

interface UserWithBadges extends User {
  badges: Badge[]
  badgeCount: number
  score: number
}

export default function ArenaPage() {
  const [users, setUsers] = useState<UserWithBadges[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const currentUser = getCurrentUser()
  const supabase = createClient()

  // Cargar usuarios y sus medallas
  const loadUsersWithBadges = async () => {
    try {
      setLoading(true)

      // Obtener todos los usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select('*')
        .order('id', { ascending: true })

      if (usersError) throw usersError

      // Cargar medallas y calcular score de cada usuario
      const usersWithBadges: UserWithBadges[] = []

      for (const user of usersData || []) {
        // Obtener medallas
        const { data: badgesData, error: badgesError } = await supabase
          .rpc('get_user_badges', { p_user_id: user.id })

        if (badgesError) {
          console.error(`Error cargando medallas del usuario ${user.id}:`, badgesError)
          continue
        }

        const badges: Badge[] = (badgesData || []).map((row: any) => ({
          badge_id: row.badge_id,
          badge_type: row.badge_type,
          badge_category: row.badge_category,
          badge_level: row.badge_level,
          title: row.title,
          description: row.description,
          icon_path: row.icon_path,
          earned_at: row.earned_at,
          metadata: row.metadata || {},
          earned: true,
        }))

        // Calcular score (total carritos / tiempo promedio)
        const { data: records } = await supabase
          .from('Records')
          .select('duration')
          .eq('users_id', user.id)

        let score = 0
        if (records && records.length > 0) {
          const avgDuration = records.reduce((sum, r) => sum + r.duration, 0) / records.length
          const totalCarts = records.length
          score = avgDuration > 0 ? totalCarts / avgDuration : 0
        }

        usersWithBadges.push({
          ...user,
          badges,
          badgeCount: badges.length,
          score,
        })
      }

      // Ordenar: 
      // 1. Por cantidad de medallas (descendente)
      // 2. Si empatan, por score (descendente)
      // 3. Si empatan, por nombre alfabético
      usersWithBadges.sort((a, b) => {
        // Primero por medallas
        if (b.badgeCount !== a.badgeCount) {
          return b.badgeCount - a.badgeCount
        }
        // Luego por score
        if (b.score !== a.score) {
          return b.score - a.score
        }
        // Finalmente por nombre
        return a.Name.localeCompare(b.Name)
      })

      setUsers(usersWithBadges)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refrescar todas las medallas (recalcular)
  const refreshAllBadges = async () => {
    try {
      setRefreshing(true)

      const { data, error } = await supabase
        .rpc('refresh_all_badges', { p_user_id: null })

      if (error) {
        console.error('Error al refrescar medallas:', error)
        throw error
      }

      console.log('Todas las medallas recalculadas:', data)

      await loadUsersWithBadges()
    } catch (err) {
      console.error('Error en refreshAllBadges:', err)
      alert('Error al refrescar medallas')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadUsersWithBadges()
  }, [])

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-gray-50 p-4 pb-24 pt-20">
          <div className="max-w-6xl mx-auto pt-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando arena...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNav />
      
      <main className="min-h-screen bg-gray-50 p-4 pb-24 pt-20">
        <div className="max-w-6xl mx-auto pt-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-gold" />
                <h1 className="text-3xl font-bold text-navy">Arena</h1>
              </div>
              
              <button
                onClick={refreshAllBadges}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar Medallas'}
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <p>Ranking de operadores por medallas y score</p>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="space-y-6">
            {users.map((user, index) => {
              const isSelected = selectedUserId === user.id
              const isCurrentUser = currentUser?.id === user.id
              const globalBadges = user.badges.filter(b => b.badge_type === 'global')
              const personalBadges = user.badges.filter(b => b.badge_type === 'personal')

              return (
                <div 
                  key={user.id} 
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all ${
                    isCurrentUser ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  {/* User Header */}
                  <div 
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isCurrentUser ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedUserId(isSelected ? null : user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Ranking Position */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-300 text-gray-800' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                          isCurrentUser ? 'bg-blue-600 ring-3 ring-blue-300' : 'bg-navy'
                        }`}>
                          {user.Name?.charAt(0).toUpperCase() || '?'}
                        </div>

                        {/* User Info */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {user.Name}
                          </h3>
                          <p className="text-sm text-gray-600">{user.Region}</p>
                          <p className="text-xs text-gray-500">Score: {user.score.toFixed(4)}</p>
                        </div>
                      </div>

                      {/* Badge Count */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gold">{user.badgeCount}</div>
                        <p className="text-sm text-gray-600">medallas</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges Grid (Expandible) */}
                  {isSelected && user.badges.length > 0 && (
                    <div className="p-6 border-t-2 border-gray-100 bg-gray-50">
                      {globalBadges.length > 0 && (
                        <div className="mb-6">
                          <BadgeGrid 
                            badges={globalBadges}
                            title="Medallas Globales"
                            size="small"
                            columns={4}
                            showMetadata={true}
                          />
                        </div>
                      )}

                      {personalBadges.length > 0 && (
                        <BadgeGrid 
                          badges={personalBadges}
                          title="Medallas Personales"
                          size="small"
                          columns={4}
                          showMetadata={true}
                        />
                      )}
                    </div>
                  )}

                  {isSelected && user.badges.length === 0 && (
                    <div className="p-6 border-t-2 border-gray-100 bg-gray-50 text-center">
                      <p className="text-gray-500">Este usuario aún no tiene medallas</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}