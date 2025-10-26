'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, AlertCircle } from 'lucide-react'
import { loginUser } from '@/lib/auth'

// Credenciales mock
const MOCK_CREDENTIALS = {
  'isis.malfavon@pickandpack.com': { password: 'isis123', userId: 10 },
  'jose.banda@pickandpack.com': { password: 'admin123', userId: 11 },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validar credenciales mock
      const credentials = MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS]
      
      if (!credentials || credentials.password !== password) {
        setError('Correo o contraseña incorrectos')
        setLoading(false)
        return
      }

      // Login con el userId correspondiente
      const user = await loginUser(credentials.userId)

      if (!user) {
        setError('Error al cargar usuario')
        setLoading(false)
        return
      }

      // Redirigir segun el rol
      if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/timer')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-navy rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-4xl">📦</span>
          </div>
          
          <h1 className="text-4xl font-bold text-navy mb-2">
            Pick & Pack
          </h1>
          
          <p className="text-gray-600">
            Sistema de gestión logística
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-navy focus:outline-none transition-colors"
              placeholder="correo@pickandpack.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-navy focus:outline-none transition-colors"
              placeholder="Ingresa tu contraseña"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy hover:bg-navy-light text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </main>
  )
}