'use client'

import { useState, useEffect } from 'react'
import { TopNav } from '@/components/layout/TopNav'
import { createClient } from '@/lib/supabase/client'
import { UserCard } from './components/UserCard'
import { StatsGrid } from './components/StatsGrid'

const mockStats = {
  avgTime: '3:45 min',
  trolleysPerFlight: 8,
  weeklyTrolleys: 156,
  bestTime: '2:30 min',
  totalFlights: 234,
  efficiency: 94,
}

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .eq('id', 1)
          .single()

        if (error) throw error
        setUser(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

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
          {user && <UserCard user={user} />}
          <StatsGrid stats={mockStats} />
        </div>
      </main>
    </>
  )
}