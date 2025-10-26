export interface AuthUser {
  id: number
  name: string
  role: 'operador' | 'admin'
  email?: string
}