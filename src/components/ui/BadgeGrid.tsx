'use client'

import { BadgeCard } from './BadgeCard'
import { sortBadges, type Badge } from '@/types/badges'

interface BadgeGridProps {
  badges: Badge[]
  title?: string
  emptyMessage?: string
  showMetadata?: boolean
  size?: 'small' | 'medium' | 'large'
  columns?: 2 | 3 | 4 | 5
}

export function BadgeGrid({ 
  badges, 
  title, 
  emptyMessage = 'No hay medallas disponibles',
  showMetadata = false,
  size = 'medium',
  columns = 4,
}: BadgeGridProps) {
  
  const sortedBadges = sortBadges([...badges])

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className={`grid ${gridColsClass[columns]} gap-4`}>
        {sortedBadges.map((badge) => (
          <BadgeCard 
            key={badge.badge_id} 
            badge={badge} 
            size={size}
            showMetadata={showMetadata}
          />
        ))}
      </div>
    </div>
  )
}