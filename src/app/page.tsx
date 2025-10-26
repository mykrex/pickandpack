'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginUser } from '@/lib/auth'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const normalizedEmail = email.trim().toLowerCase()
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Limpiar y normalizar el email
      const normalizedEmail = email.trim().toLowerCase()
      
      console.log('Buscando usuario con email:', normalizedEmail)

      // Buscar usuario por email (normalizado y sin case-sensitive)
      const { data, error: dbError } = await supabase
        .from('Users')
        .select('id, Name, correo, contrasena')
        .ilike('correo', normalizedEmail) // ← CAMBIO: usar ilike en vez de eq para ignorar mayúsculas/minúsculas
        .single()

      console.log('Resultado:', data)
      console.log('Error:', dbError)

      if (dbError) {
        console.error('Error de Supabase:', dbError)
        setError('Usuario no encontrado')
        setLoading(false)
        return
      }

      if (!data) {
        setError('Usuario no encontrado')
        setLoading(false)
        return
      }

      // Verificar contraseña
      if (data.contrasena !== password) {
        console.log('Contraseña incorrecta')
        setError('Contraseña incorrecta')
        setLoading(false)
        return
      }

      console.log('Login exitoso, cargando usuario...')

      // Cargar usuario en el sistema de auth
      const user = await loginUser(data.id)

      if (!user) {
        setError('Error al cargar usuario')
        setLoading(false)
        return
      }

      console.log('Usuario cargado:', user)

      // Redirigir según rol
      if (user.role === 'admin') {
        console.log('Redirigiendo a /admin')
        router.push('/admin')
      } else {
        console.log('Redirigiendo a /timer')
        router.push('/timer')
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error de sistema')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-navy rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-2">Turbo Trolly</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-navy focus:outline-none"
              placeholder="tu@email.com"
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-navy focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white font-semibold py-3 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5 inline mr-2" />
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Ayuda para debugging - puedes quitar esto después */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800 font-mono">
            Debug: {normalizedEmail || 'Escribe tu email'}
          </p>
        </div>
      </div>
    </main>
  )
}