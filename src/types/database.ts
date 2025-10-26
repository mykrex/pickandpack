export interface User {
  id: number
  Name: string
  fecha_ingreso: Date
  Region: string
  correo?: string
  contrasena?: string
}

export interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  earned: boolean
}

export interface Drawer {
  Drawer_ID: string
  Flight_Type: string
  Drawer_Category: string
  Total_Items: number
  Unique_Item_Types: number
  Item_List: string
}

export interface BadgeDefinition {
  id: number
  badge_type: 'global' | 'personal'
  badge_category: string
  badge_level: string
  title: string
  description: string
  icon_path: string
  criteria: any
  created_at: string
}

export interface UserBadge {
  id: number
  user_id: number
  badge_type: 'global' | 'personal'
  badge_category: string
  badge_level: string
  earned_at: string
  metadata: any
}

export interface Record {
  record_id: number
  created_at: string
  drawers_id: string
  users_id: number
  duration: number
}