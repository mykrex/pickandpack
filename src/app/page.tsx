'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, AlertCircle, X, Key } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginUser } from '@/lib/auth'
import { TurboLogo } from '@/components/ui/TurboLogo'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCredentials, setShowCredentials] = useState(false) // CAMBIADO A FALSE
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

  // Función para llenar credenciales
  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setShowCredentials(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-navy-light rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* POPUP FLOTANTE DE CREDENCIALES - Solo aparece cuando showCredentials es true */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in slide-in-from-bottom-4">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowCredentials(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Credenciales de Prueba</h3>
                <p className="text-sm text-gray-600">Haz clic para autocompletar</p>
              </div>
            </div>

            {/* Credenciales */}
            <div className="space-y-3">
              {/* Usuario */}
              <button
                onClick={() => fillCredentials('isis@gategroup.com', 'isis123')}
                className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-900">Usuario</span>
                  <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click para usar
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded">
                    isis@gategroup.com
                  </p>
                  <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded">
                    isis123
                  </p>
                </div>
              </button>

              {/* Admin */}
              <button
                onClick={() => fillCredentials('jose.d@gategroup.com', 'admin123')}
                className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-900">Admin</span>
                  <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click para usar
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded">
                    jose.d@gategroup.com
                  </p>
                  <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded">
                    admin123
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowCredentials(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 group"
        title="Ver credenciales de prueba"
      >
        <Key className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          ?
        </span>
      </button>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <div className="text-center mb-4">
          {/* Logo de Turbo */}
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

        {/* Pequeño Turbo en la esquina */}
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <TurboLogo size={120} animated={false} showBody={false} />
        </div>
      </div>
    </main>
  )
}