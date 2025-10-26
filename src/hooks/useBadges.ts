'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Badge, RefreshBadgesResponse, BadgeStats } from '@/types/badges'

interface UseBadgesOptions {
  userId?: number
  autoRefresh?: boolean
  refreshOnMount?: boolean
}

interface UseBadgesReturn {
  badges: Badge[]
  loading: boolean
  error: string | null
  stats: BadgeStats
  refreshBadges: () => Promise<void>
  getBadgesByType: (type: 'global' | 'personal') => Badge[]
  getBadgesByCategory: (category: string) => Badge[]
}

export function useBadges(options: UseBadgesOptions = {}): UseBadgesReturn {
  const { userId, autoRefresh = false, refreshOnMount = true } = options
  
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Calcular estadísticas
  const calculateStats = useCallback((badgeList: Badge[]): BadgeStats => {
    const stats: BadgeStats = {
      total: badgeList.length,
      global: badgeList.filter(b => b.badge_type === 'global').length,
      personal: badgeList.filter(b => b.badge_type === 'personal').length,
      by_category: {},
      by_level: {},
    }

    badgeList.forEach(badge => {
      stats.by_category[badge.badge_category] = 
        (stats.by_category[badge.badge_category] || 0) + 1
      stats.by_level[badge.badge_level] = 
        (stats.by_level[badge.badge_level] || 0) + 1
    })

    return stats
  }, [])

  // Función para refrescar medallas (ejecutar función SQL)
  const refreshBadges = useCallback(async () => {
    if (!userId) {
      setError('No se especificó un usuario')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Llamar a la función SQL para recalcular medallas
      const { data: refreshResult, error: refreshError } = await supabase
        .rpc('refresh_all_badges', { p_user_id: userId })

      if (refreshError) {
        console.error('Error al refrescar medallas:', refreshError)
        throw refreshError
      }

      const result = refreshResult as RefreshBadgesResponse

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido al refrescar medallas')
      }

      console.log('Medallas actualizadas:', result)

      // Cargar las medallas actualizadas
      await loadBadges()
      
    } catch (err) {
      console.error('Error en refreshBadges:', err)
      setError(err instanceof Error ? err.message : 'Error al refrescar medallas')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Función para cargar medallas del usuario
  const loadBadges = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Llamar a la función SQL que obtiene las medallas con toda su info
      const { data, error: loadError } = await supabase
        .rpc('get_user_badges', { p_user_id: userId })

      if (loadError) {
        console.error('Error al cargar medallas:', loadError)
        throw loadError
      }

      // Mapear los datos al formato Badge
      const badgeList: Badge[] = (data || []).map((row: any) => ({
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

      setBadges(badgeList)
    } catch (err) {
      console.error('Error en loadBadges:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar medallas')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Filtrar medallas por tipo
  const getBadgesByType = useCallback((type: 'global' | 'personal'): Badge[] => {
    return badges.filter(b => b.badge_type === type)
  }, [badges])

  // Filtrar medallas por categoría
  const getBadgesByCategory = useCallback((category: string): Badge[] => {
    return badges.filter(b => b.badge_category === category)
  }, [badges])

  // Efecto para cargar medallas al montar o cuando cambie userId
  useEffect(() => {
    if (refreshOnMount && userId) {
      refreshBadges()
    } else if (userId) {
      loadBadges()
    }
  }, [userId, refreshOnMount])

  // Efecto para auto-refresh periódico (opcional)
  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(() => {
      loadBadges()
    }, 60000) // Cada 60 segundos

    return () => clearInterval(interval)
  }, [autoRefresh, userId, loadBadges])

  const stats = calculateStats(badges)

  return {
    badges,
    loading,
    error,
    stats,
    refreshBadges,
    getBadgesByType,
    getBadgesByCategory,
  }
}

// Otener medallas de todos los usuarios (para Arena)
export function useAllUsersBadges() {
  const [usersBadges, setUsersBadges] = useState<Record<number, Badge[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadAllBadges = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener todos los usuarios
      const { data: users, error: usersError } = await supabase
        .from('Users')
        .select('id')

      if (usersError) throw usersError

      const badgesMap: Record<number, Badge[]> = {}

      // Cargar medallas de cada usuario
      for (const user of users || []) {
        const { data, error: badgesError } = await supabase
          .rpc('get_user_badges', { p_user_id: user.id })

        if (badgesError) {
          console.error(`Error cargando medallas del usuario ${user.id}:`, badgesError)
          continue
        }

        badgesMap[user.id] = (data || []).map((row: any) => ({
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
      }

      setUsersBadges(badgesMap)
    } catch (err) {
      console.error('Error en loadAllBadges:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar medallas')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadAllBadges()
  }, [loadAllBadges])

  return {
    usersBadges,
    loading,
    error,
    refreshAll: loadAllBadges,
  }
}