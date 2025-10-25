import { StatCard } from '@/components/ui/StatCard'
import { Clock, Plane, Calendar, Trophy, Rocket, Target } from 'lucide-react'

interface Stats {
  avgTime: string
  trolleysPerFlight: number
  weeklyTrolleys: number
  bestTime: string
  totalFlights: number
  efficiency: number
}

interface StatsGridProps {
  stats: Stats
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-100">
      <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
        <Target className="w-6 h-6" />
        Estadísticas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Tiempo Promedio"
          value={stats.avgTime}
          variant="primary"
          trend="down"
          trendValue="5%"
        />
        
        <StatCard
          icon={Plane}
          label="Trolleys por Vuelo"
          value={stats.trolleysPerFlight}
          variant="secondary"
          trend="up"
          trendValue="2"
        />
        
        <StatCard
          icon={Calendar}
          label="Trolleys esta Semana"
          value={stats.weeklyTrolleys}
          variant="accent"
          trend="up"
          trendValue="12%"
        />
        
        <StatCard
          icon={Trophy}
          label="Mejor Tiempo"
          value={stats.bestTime}
          variant="primary"
        />
        
        <StatCard
          icon={Rocket}
          label="Vuelos Completados"
          value={stats.totalFlights}
          variant="secondary"
        />
        
        <StatCard
          icon={Target}
          label="Eficiencia"
          value={`${stats.efficiency}%`}
          variant="accent"
          trend="up"
          trendValue="3%"
        />
      </div>
    </div>
  )
}