'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '@/components/layout/AdminNav'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Trophy, TrendingUp, Globe, Clock, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TopUser {
  user_id: number
  user_name: string
  best_time: number
  region: string
}

interface RegionAverage {
  region: string
  average_time: number
  total_records: number
}

interface TimelineData {
  date: string
  average: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [regionAverages, setRegionAverages] = useState<RegionAverage[]>([])
  const [globalAverage, setGlobalAverage] = useState<number>(0)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRealtime, setIsRealtime] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      router.push('/')
      return
    }
    setUser(currentUser)
  }, [router])

  // Función para cargar todos los datos
  const fetchDashboardData = async () => {
    try {
      // Top 3 usuarios con mejores tiempos
      const { data: recordsData } = await supabase
        .from('Records')
        .select('users_id, duration, Users(Name, Region)')
        .order('duration', { ascending: true })

      if (recordsData) {
        // Agrupar por usuario y obtener su mejor tiempo
        const userBestTimes = new Map<number, { name: string; time: number; region: string }>()
        
        recordsData.forEach((record: any) => {
          const userId = record.users_id
          const duration = record.duration
          const userName = record.Users?.Name || 'Desconocido'
          const userRegion = record.Users?.Region || 'N/A'

          if (!userBestTimes.has(userId) || userBestTimes.get(userId)!.time > duration) {
            userBestTimes.set(userId, { name: userName, time: duration, region: userRegion })
          }
        })

        // Convertir a array y ordenar
        const top3 = Array.from(userBestTimes.entries())
          .map(([userId, data]) => ({
            user_id: userId,
            user_name: data.name,
            best_time: data.time,
            region: data.region
          }))
          .sort((a, b) => a.best_time - b.best_time)
          .slice(0, 3)

        setTopUsers(top3)
      }

      // Promedio por región
      const { data: allRecords } = await supabase
        .from('Records')
        .select('duration, Users(Region)')

      if (allRecords) {
        const regionData = new Map<string, { total: number; count: number }>()

        allRecords.forEach((record: any) => {
          const region = record.Users?.Region || 'Sin región'
          const duration = record.duration

          if (!regionData.has(region)) {
            regionData.set(region, { total: 0, count: 0 })
          }

          const data = regionData.get(region)!
          data.total += duration
          data.count += 1
        })

        const averages = Array.from(regionData.entries())
          .map(([region, data]) => ({
            region,
            average_time: data.total / data.count,
            total_records: data.count
          }))
          .sort((a, b) => a.average_time - b.average_time)

        setRegionAverages(averages)
      }

      // Promedio global
      const { data: allDurations } = await supabase
        .from('Records')
        .select('duration')

      if (allDurations && allDurations.length > 0) {
        const total = allDurations.reduce((sum: number, record: any) => sum + record.duration, 0)
        setGlobalAverage(total / allDurations.length)
      }

      // Datos para la gráfica (últimos 30 días)
      const { data: timelineRecords } = await supabase
        .from('Records')
        .select('created_at, duration')
        .order('created_at', { ascending: true })

      if (timelineRecords) {
        // Agrupar por fecha y calcular promedio
        const dailyData = new Map<string, { total: number; count: number }>()

        timelineRecords.forEach((record: any) => {
          const date = new Date(record.created_at).toLocaleDateString('es-MX')
          
          if (!dailyData.has(date)) {
            dailyData.set(date, { total: 0, count: 0 })
          }

          const data = dailyData.get(date)!
          data.total += record.duration
          data.count += 1
        })

        const timeline = Array.from(dailyData.entries())
          .map(([date, data]) => ({
            date,
            average: Math.round(data.total / data.count)
          }))
          .slice(-30) // Últimos 30 días

        setTimelineData(timeline)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  // Cargar datos inicialmente
  useEffect(() => {
    if (user && isAdmin(user)) {
      fetchDashboardData()
    }
  }, [user])

  // Configurar Realtime
  useEffect(() => {
    if (!user || !isAdmin(user)) return

    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Records'
        },
        () => {
          console.log('Nuevo record detectado, actualizando dashboard...')
          fetchDashboardData()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true)
          console.log('Realtime conectado')
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsRealtime(false)
    }
  }, [user])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
    
    if (diff < 60) return 'Hace unos segundos'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    return lastUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  if (!user || !isAdmin(user)) {
    return null
  }

  return (
    <>
      <AdminNav />
      
      <main className="min-h-screen bg-gray-50 p-4 pt-20">
        <div className="max-w-7xl mx-auto pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600">
                Monitoreo en tiempo real del rendimiento del equipo
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                {isRealtime ? (
                  <>
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-green-600 font-semibold">Datos en tiempo real</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Conectando...</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatLastUpdate()}
              </p>
            </div>
          </div>

          {/* Promedio Global */}
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Promedio Global</h2>
                </div>
                <p className="text-blue-100">Tiempo promedio de todos los registros</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{formatTime(Math.round(globalAverage))}</div>
                <p className="text-blue-200 text-sm mt-1">por carrito</p>
              </div>
            </div>
          </div>

          {/* Top 3 Usuarios */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-7 h-7 text-gold" />
              <h2 className="text-2xl font-bold text-navy">Top 3 Mejores Tiempos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topUsers.map((user, index) => (
                <div
                  key={user.user_id}
                  className={`relative p-6 rounded-xl border-2 ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-gold shadow-lg'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                      : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
                  }`}
                >
                  {/* Medalla */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-gray-200">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>

                  {/* Posición */}
                  <div className="text-6xl font-bold text-gray-300 absolute top-4 left-4">
                    #{index + 1}
                  </div>

                  {/* Contenido */}
                  <div className="relative z-10 mt-12">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        index === 0 ? 'bg-gold' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {user.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{user.user_name}</h3>
                        <p className="text-xs text-gray-600">{user.region}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="text-3xl font-bold text-navy">{formatTime(user.best_time)}</div>
                      <p className="text-sm text-gray-600 mt-1">Mejor tiempo</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promedios por Región */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-7 h-7 text-navy" />
              <h2 className="text-2xl font-bold text-navy">Promedio por Región</h2>
            </div>

            <div className="space-y-4">
              {regionAverages.map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{region.region}</h3>
                      <p className="text-sm text-gray-500">{region.total_records} registros</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-navy">{formatTime(Math.round(region.average_time))}</div>
                    <p className="text-xs text-gray-500">{region.average_time.toFixed(0)} seg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfica de Evolución */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-7 h-7 text-navy" />
              <h2 className="text-2xl font-bold text-navy">Evolución del Tiempo Promedio</h2>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Segundos', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '2px solid #000064',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${formatTime(value)} (${value}s)`, 'Promedio']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#000064" 
                    strokeWidth={3}
                    dot={{ fill: '#000064', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm text-gray-500 text-center mt-4">
              Mostrando los últimos {timelineData.length} días con registros
            </p>
          </div>
        </div>
      </main>
    </>
  )
}