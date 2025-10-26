import { createClient } from './supabase/client'
import type { AuthUser } from '@/types/auth'

export async function loginUser(userId: number): Promise<AuthUser | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('id, Name')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Error al obtener usuario:', error)
      return null
    }

    // Determinar rol basado en el ID
    const role = userId === 11 ? 'admin' : 'operador'
    
    // Generar email basado en el nombre
    const emailMap: { [key: number]: string } = {
      10: 'isis.malfavon@pickandpack.com',
      11: 'jose.banda@pickandpack.com',
    }

    const user: AuthUser = {
      id: data.id,
      name: data.Name,
      role: role,
      email: emailMap[userId] || `${data.Name.toLowerCase().replace(/\s+/g, '.')}@pickandpack.com`
    }

    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(user))

    return user
  } catch (err) {
    console.error('Error en login:', err)
    return null
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr) as AuthUser
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('user')
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin'
}