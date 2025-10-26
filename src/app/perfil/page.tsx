'use client'

import { useState } from 'react'
import { TopNav } from '@/components/layout/TopNav'
import { getCurrentUser } from '@/lib/auth'
import { useBadges } from '@/hooks/useBadges'
import { UserCard } from './components/UserCard'
import { StatsGrid } from './components/StatsGrid'
import { BadgeGrid } from '@/components/ui/BadgeGrid'
import { RefreshCw, Award, Globe, Star } from 'lucide-react'

export default function PerfilPage() {
  const currentUser = getCurrentUser()
  const { 
    badges, 
    loading, 
    error, 
    stats,
    refreshBadges,
    getBadgesByType 
  } = useBadges({ 
    userId: currentUser?.id,
    refreshOnMount: false
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshBadges = async () => {
    setIsRefreshing(true)
    await refreshBadges()
    setIsRefreshing(false)
  }

  const globalBadges = getBadgesByType('global')
  const personalBadges = getBadgesByType('personal')

  if (loading && badges.length === 0) {
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

  if (error) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-gray-50 p-4 pt-20">
          <div className="max-w-6xl mx-auto pt-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-semibold">Error al cargar las medallas</p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
              <button
                onClick={handleRefreshBadges}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!currentUser) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-gray-50 p-4 pt-20">
          <div className="max-w-6xl mx-auto pt-8">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-700 font-semibold">No hay usuario autenticado</p>
              <p className="text-yellow-600 text-sm mt-2">Por favor inicia sesión</p>
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
          {/* User Card con datos reales */}
          <UserCard 
            user={{
              id: currentUser.id,
              Name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role
            }} 
            badgeCount={stats.total} 
          />

          {/* Stats Grid con datos reales - PASANDO userId */}
          <StatsGrid userId={currentUser.id} />

          {/* Botón de Actualizar Medallas */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-gold" />
                <div>
                  <h2 className="text-xl font-bold text-navy">Mis Medallas</h2>
                  <p className="text-sm text-gray-600">
                    {stats.total} medallas obtenidas ({stats.global} globales, {stats.personal} personales)
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefreshBadges}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {/* Medallas Globales */}
          {globalBadges.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">🌍 Medallas Globales</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Medallas obtenidas por estar en el Top 4 de todos los operadores
              </p>
              <BadgeGrid 
                badges={globalBadges}
                emptyMessage="Aún no tienes medallas globales"
                showMetadata={true}
                size="medium"
                columns={4}
              />
            </div>
          )}

          {/* Medallas Personales */}
          {personalBadges.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">⭐ Medallas Personales</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Medallas obtenidas por tus logros individuales
              </p>
              <BadgeGrid 
                badges={personalBadges}
                emptyMessage="Aún no tienes medallas personales"
                showMetadata={true}
                size="medium"
                columns={4}
              />
            </div>
          )}

          {/* Si no tiene ninguna medalla */}
          {badges.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Comienza tu aventura!
              </h3>
              <p className="text-gray-600 mb-6">
                Completa tus tareas para desbloquear medallas
              </p>
              <button
                onClick={handleRefreshBadges}
                className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors font-semibold"
              >
                Verificar Medallas
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}