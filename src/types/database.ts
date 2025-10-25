export interface User {
  id: number
  Name: string
  created_at?: string
  // Agrega más campos si tu tabla tiene más columnas
}

export interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  earned: boolean
}