'use client'

import { useEffect, useState } from 'react'
import { TopNav } from '@/components/layout/TopNav'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import type { User } from '@/types/database'

const mockBadges = [
  { id: 1, icon: '🎉', title: 'Primer día', earned: true, earnedDate: '15 Oct 2024' },
  { id: 2, icon: '⚡', title: 'Eficiente', earned: true, earnedDate: '18 Oct 2024' },
  { id: 3, icon: '🔥', title: 'Racha', earned: false },
  { id: 4, icon: '💯', title: 'Perfect', earned: false },
]

export default function ArenaPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .order('id', { ascending: true })

        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const getUserBadges = (userId: number) => {
    return mockBadges.filter((b, i) => (userId + i) % 3 !== 0)
  }

  if (loading) {
    return (
      <>
        <TopNav />

        <main className="min-h-screen bg-gray-50 p-4 pb-24">
          <div className="max-w-6xl mx-auto pt-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-navy mx-auto"></div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNav />
      
      <main className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-navy mb-6">🏆 Arena</h1>
            
            <div className="space-y-6">
              {users.map((user) => {
                const badges = getUserBadges(user.id)
                const earnedCount = badges.filter(b => b.earned).length

                return (
                  <div key={user.id} className="border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-navy rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user.Name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{user.Name}</h3>
                          <p className="text-sm text-gray-600">{earnedCount} medallas</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gold"># {user.id}</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {badges.map((badge) => (
                        <Badge key={badge.id} {...badge} description="" />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}