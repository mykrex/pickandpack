'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNav } from '@/components/layout/AdminNav'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

export default function UsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      router.push('/')
      return
    }

    async function fetchUsers() {
      const { data } = await supabase
        .from('Users')
        .select('*')
        .order('id', { ascending: true })

      setUsers(data || [])
      setLoading(false)
    }

    fetchUsers()
  }, [router])

  if (loading) {
    return (
      <>
        <AdminNav />
        <main className="min-h-screen bg-gray-50 p-4 pt-20">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-navy mb-8">
            Gestión de Usuarios
          </h1>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Nombre</th>
                  <th className="px-6 py-4 text-left">Fecha Ingreso</th>
                  <th className="px-6 py-4 text-left">Región</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-navy">{user.id}</td>
                    <td className="px-6 py-4">{user.Name}</td>
                    <td className="px-6 py-4 text-gray-600">
                        {user.fecha_ingreso 
                          ? new Date(user.fecha_ingreso).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.Region || 'N/A'}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-navy hover:text-navy-light font-medium">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}