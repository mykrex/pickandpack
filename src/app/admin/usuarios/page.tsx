'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '@/components/layout/AdminNav'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

interface UserWithStats extends User {
  avgTime: number
  avgTimeFormatted: string
  totalRecords: number
}

export default function UsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      router.push('/')
      return
    }

    async function fetchUsersWithStats() {
      try {
        // Obtener todos los usuarios
        const { data: usersData } = await supabase
          .from('Users')
          .select('*')

        if (!usersData) {
          setLoading(false)
          return
        }

        // Calcular tiempo promedio de cada usuario
        const usersWithStats: UserWithStats[] = []

        for (const user of usersData) {
          const { data: records } = await supabase
            .from('Records')
            .select('duration')
            .eq('users_id', user.id)

          let avgTime = 0
          let avgTimeFormatted = '--:--'

          if (records && records.length > 0) {
            avgTime = records.reduce((sum, r) => sum + r.duration, 0) / records.length
            const minutes = Math.floor(avgTime / 60)
            const seconds = Math.floor(avgTime % 60)
            avgTimeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
          }

          usersWithStats.push({
            ...user,
            avgTime,
            avgTimeFormatted,
            totalRecords: records?.length || 0,
          })
        }

        // Ordenar por tiempo promedio (menor a mayor)
        // Usuarios sin registros van al final
        usersWithStats.sort((a, b) => {
          if (a.totalRecords === 0) return 1
          if (b.totalRecords === 0) return -1
          return a.avgTime - b.avgTime
        })

        setUsers(usersWithStats)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsersWithStats()
  }, [router])

  if (loading) {
    return (
      <>
        <AdminNav />
        <main className="min-h-screen bg-gray-50 p-4 pt-20">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      
      <main className="min-h-screen bg-gray-50 p-4 pt-20">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-navy mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Usuarios ordenados por mejor tiempo promedio
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Ranking</th>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Nombre</th>
                  <th className="px-6 py-4 text-left">Región</th>
                  <th className="px-6 py-4 text-center">Tiempo Promedio</th>
                  <th className="px-6 py-4 text-center">Total Registros</th>
                  <th className="px-6 py-4 text-left">Fecha Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {/* Ranking */}
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-gray-800' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        #{index + 1}
                      </div>
                    </td>
                    
                    {/* ID */}
                    <td className="px-6 py-4 font-semibold text-navy">{user.id}</td>
                    
                    {/* Nombre */}
                    <td className="px-6 py-4 font-medium">{user.Name}</td>
                    
                    {/* Región */}
                    <td className="px-6 py-4 text-gray-600">{user.Region || 'N/A'}</td>
                    
                    {/* Tiempo Promedio */}
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${
                        user.totalRecords === 0 ? 'text-gray-400' : 'text-navy'
                      }`}>
                        {user.avgTimeFormatted}
                      </span>
                    </td>
                    
                    {/* Total Registros */}
                    <td className="px-6 py-4 text-center text-gray-600">
                      {user.totalRecords}
                    </td>
                    
                    {/* Fecha Ingreso */}
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {user.fecha_ingreso 
                        ? new Date(user.fecha_ingreso).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>📊 Orden:</strong> Los usuarios están ordenados por su tiempo promedio de menor a mayor (más rápido primero). 
              Los usuarios sin registros aparecen al final.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}