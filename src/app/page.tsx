'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginUser } from '@/lib/auth'
import { TurboLogo } from '@/components/ui/TurboLogo'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      
      const { data, error: dbError } = await supabase
        .from('Users')
        .select('id, Name, correo, contrasena')
        .ilike('correo', normalizedEmail)

      if (dbError) {
        console.error('Error de Supabase:', dbError)
        setError('Error al buscar usuario')
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError('Usuario no encontrado')
        setLoading(false)
        return
      }

      let userFound = null
      
      for (const user of data) {
        if (user.contrasena === password) {
          userFound = user
          break
        }
      }

      if (!userFound) {
        setError('Contraseña incorrecta')
        setLoading(false)
        return
      }

      const user = await loginUser(userFound.id)

      if (!user) {
        setError('Error al cargar usuario')
        setLoading(false)
        return
      }

      if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/timer')
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error de sistema')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-navy-light rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <div className="text-center mb-4">
          {/* Logo de Turbo - Solo carita, con animación */}
          <div className="mx-auto mb-6 flex justify-center">
            <TurboLogo size={120} animated={true} showBody={false} />
          </div>

          <h1 className="text-4xl font-bold text-navy mb-2">Turbo Trolley</h1>
          <p className="text-gray-600">Bienvenido de vuelta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-navy focus:outline-none transition-colors text-gray-600"
              placeholder="usuario@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-navy focus:outline-none transition-colors text-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white font-semibold py-3 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Pequeño Turbo en la esquina - Sin animación */}
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <TurboLogo size={120} animated={false} showBody={false} />
        </div>
      </div>
    </main>
  )
}