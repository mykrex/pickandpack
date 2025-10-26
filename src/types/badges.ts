export type BadgeType = 'global' | 'personal'

export type GlobalBadgeCategory = 'antiguedad' | 'carritos' | 'velocidad' | 'tops'
export type PersonalBadgeCategory = 'antiguedad' | 'carrito_economy' | 'carrito_business' | 'eficiencia'
export type BadgeCategory = GlobalBadgeCategory | PersonalBadgeCategory

export type GlobalBadgeLevel = 'bronce' | 'plata' | 'oro' | 'diamante'
export type PersonalBadgeLevel = 'nivel1' | 'nivel2' | 'nivel3' | 'nivel4' | 'nivel5'
export type BadgeLevel = GlobalBadgeLevel | PersonalBadgeLevel

// Metadatos especificos por tipo de medalla
export interface AntiguedadMetadata {
  months: number
  years: number
  fecha_ingreso?: string
  rank?: number
}

export interface CarritosMetadata {
  count?: number
  total_carts?: number
  rank?: number
}

export interface VelocidadMetadata {
  best_time?: number
  improvements?: number
  first_time?: number
  rank?: number
  minutes?: number
  seconds?: number
}

export interface TopsMetadata {
  rank: number
  total_carts: number
  avg_time: number
  efficiency_score: number
}

export type BadgeMetadata = 
  | AntiguedadMetadata 
  | CarritosMetadata 
  | VelocidadMetadata 
  | TopsMetadata 
  | Record<string, any>

// Definicion de medalla 
export interface BadgeDefinition {
  id: number
  badge_type: BadgeType
  badge_category: BadgeCategory
  badge_level: BadgeLevel
  title: string
  description: string
  icon_path: string
  criteria: Record<string, any>
  created_at: string
}

// Medalla obtenida por usuario
export interface UserBadge {
  id: number
  user_id: number
  badge_type: BadgeType
  badge_category: BadgeCategory
  badge_level: BadgeLevel
  earned_at: string
  metadata: BadgeMetadata
}

// Medalla completa (unión de definición y obtención)
export interface Badge {
  badge_id: number
  badge_type: BadgeType
  badge_category: BadgeCategory
  badge_level: BadgeLevel
  title: string
  description: string
  icon_path: string
  earned_at: string
  metadata: BadgeMetadata
  earned: boolean
}

// Respuesta de la función refresh_all_badges
export interface RefreshBadgesResponse {
  success: boolean
  user_id?: number
  personal_badges_updated?: number
  global_badges_updated?: number
  execution_time_ms?: number
  timestamp: string
  error?: string
}

// Agrupación de medallas por tipo
export interface BadgesByType {
  global: Badge[]
  personal: Badge[]
}

// Estadísticas de medallas de un usuario
export interface BadgeStats {
  total: number
  global: number
  personal: number
  by_category: Record<string, number>
  by_level: Record<string, number>
}

// Props para componentes
export interface BadgeCardProps {
  badge: Badge
  size?: 'small' | 'medium' | 'large'
  showMetadata?: boolean
  onClick?: () => void
}

export interface BadgeGridProps {
  badges: Badge[]
  title?: string
  emptyMessage?: string
}

// Helpers para formateo
export const formatBadgeLevel = (level: BadgeLevel): string => {
  if (level.startsWith('nivel')) {
    return `Nivel ${level.replace('nivel', '')}`
  }
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export const formatBadgeCategory = (category: BadgeCategory): string => {
  const categoryNames: Record<BadgeCategory, string> = {
    antiguedad: 'Antigüedad',
    carritos: 'Carritos',
    velocidad: 'Velocidad',
    tops: 'Tops',
    carrito_economy: 'Carritos Economy',
    carrito_business: 'Carritos Business',
    eficiencia: 'Eficiencia',
  }
  return categoryNames[category] || category
}

export const getBadgeLevelColor = (level: BadgeLevel): string => {
  const colors: Record<BadgeLevel, string> = {
    bronce: 'bg-orange-50 border-orange-400 text-orange-800',
    plata: 'bg-gray-100 border-gray-400 text-gray-800',
    oro: 'bg-amber-50 border-amber-500 text-yellow-900',
    diamante: 'bg-blue-100 border-blue-500 text-blue-900',
    nivel1: 'bg-green-50 border-green-300 text-green-800',
    nivel2: 'bg-green-100 border-green-400 text-green-800',
    nivel3: 'bg-blue-100 border-blue-400 text-blue-800',
    nivel4: 'bg-purple-100 border-purple-400 text-purple-800',
    nivel5: 'bg-pink-100 border-pink-400 text-pink-800',
  }
  return colors[level] || 'bg-gray-100 border-gray-300 text-gray-800'
}

// Función para ordenar medallas
export const sortBadges = (badges: Badge[]): Badge[] => {
  const levelOrder: Record<string, number> = {
    diamante: 4,
    oro: 3,
    plata: 2,
    bronce: 1,
    nivel5: 5,
    nivel4: 4,
    nivel3: 3,
    nivel2: 2,
    nivel1: 1,
  }

  return badges.sort((a, b) => {
    // Primero por tipo (globales primero)
    if (a.badge_type !== b.badge_type) {
      return a.badge_type === 'global' ? -1 : 1
    }
    // Luego por nivel (mayor a menor)
    const levelA = levelOrder[a.badge_level] || 0
    const levelB = levelOrder[b.badge_level] || 0
    if (levelA !== levelB) {
      return levelB - levelA
    }
    // Finalmente por fecha (más reciente primero)
    return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
  })
}