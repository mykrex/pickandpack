export interface User {
  id: number
  Name: string
  fecha_ingreso: Date
  Region: string
  // Agrega más campos si tu tabla tiene más columnas
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