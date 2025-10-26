'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { Clock, Plane, Calendar, Trophy, Rocket, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  avgTime: string
  trolleysPerFlight: number
  weeklyTrolleys: number
  bestTime: string
  totalFlights: number
  efficiency: number
  score?: number
}

interface StatsGridProps {
  userId: number
}

export function StatsGrid({ userId }: StatsGridProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserStats() {
      try {
        // Obtener todos los registros del usuario
        const { data: records, error } = await supabase
          .from('Records')
          .select('duration')
          .eq('users_id', userId)

        if (error) throw error

        if (!records || records.length === 0) {
          // Si no tiene registros, usar datos mock
          setStats({
            avgTime: '--:--',
            trolleysPerFlight: 8,
            weeklyTrolleys: 0,
            bestTime: '--:--',
            totalFlights: 234,
            efficiency: 0,
            score: 0,
          })
          setLoading(false)
          return
        }

        // Calcular tiempo promedio
        const avgDuration = records.reduce((sum, r) => sum + r.duration, 0) / records.length
        const avgMinutes = Math.floor(avgDuration / 60)
        const avgSeconds = Math.floor(avgDuration % 60)
        const avgTimeFormatted = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')} min`

        // Calcular mejor tiempo
        const bestDuration = Math.min(...records.map(r => r.duration))
        const bestMinutes = Math.floor(bestDuration / 60)
        const bestSeconds = Math.floor(bestDuration % 60)
        const bestTimeFormatted = `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')} min`

        // Calcular score (total carritos / tiempo promedio)
        const totalCarts = records.length
        const score = avgDuration > 0 
          ? Number((totalCarts / avgDuration).toFixed(4))
          : 0

        setStats({
          avgTime: avgTimeFormatted,
          trolleysPerFlight: 8, // Mock
          weeklyTrolleys: 156, // Mock
          bestTime: bestTimeFormatted,
          totalFlights: 234, // Mock
          efficiency: 94, // Este se reemplazará por score
          score: score,
        })
      } catch (err) {
        console.error('Error al cargar estadísticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-100">
      <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
        <Target className="w-6 h-6" />
        Estadísticas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* REAL: Tiempo Promedio */}
        <StatCard
          icon={Clock}
          label="Tiempo Promedio"
          value={stats.avgTime}
          variant="primary"
        />
        
        {/* MOCK: Trolleys por Vuelo */}
        <StatCard
          icon={Plane}
          label="Trolleys por Vuelo"
          value={stats.trolleysPerFlight}
          variant="secondary"
          trend="up"
          trendValue="2"
        />
        
        {/* MOCK: Trolleys esta Semana */}
        <StatCard
          icon={Calendar}
          label="Trolleys esta Semana"
          value={stats.weeklyTrolleys}
          variant="accent"
          trend="up"
          trendValue="12%"
        />
        
        {/* REAL: Mejor Tiempo */}
        <StatCard
          icon={Trophy}
          label="Mejor Tiempo"
          value={stats.bestTime}
          variant="primary"
        />
        
        {/* MOCK: Vuelos Completados */}
        <StatCard
          icon={Rocket}
          label="Vuelos Completados"
          value={stats.totalFlights}
          variant="secondary"
        />
        
        {/* REAL: Score (en lugar de Eficiencia) */}
        <StatCard
          icon={Target}
          label="Score"
          value={stats.score?.toFixed(4) || '0.0000'}
          variant="accent"
        />
      </div>
    </div>
  )
}