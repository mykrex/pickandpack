'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  formatBadgeLevel, 
  formatBadgeCategory, 
  getBadgeLevelColor,
  type Badge 
} from '@/types/badges'

interface BadgeCardProps {
  badge: Badge
  size?: 'small' | 'medium' | 'large'
  showMetadata?: boolean
  onClick?: () => void
}

export function BadgeCard({ 
  badge, 
  size = 'medium', 
  showMetadata = false,
  onClick 
}: BadgeCardProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  }

  const iconSizes = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const renderMetadata = () => {
    if (!showMetadata || !badge.metadata) return null

    const { metadata, badge_category } = badge

    // Formatear metadata según la categoría
    if (badge_category === 'antiguedad' && 'years' in metadata) {
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Antigüedad:</span>
            <span className="font-semibold">{metadata.years} años</span>
          </div>
        </div>
      )
    }

    if (badge_category === 'carritos' && 'total_carts' in metadata) {
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Total carritos:</span>
            <span className="font-semibold">{metadata.total_carts}</span>
          </div>
        </div>
      )
    }

    if (badge_category === 'velocidad' && 'best_time' in metadata) {
      const mins = Math.floor(metadata.best_time / 60)
      const secs = metadata.best_time % 60
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Mejor tiempo:</span>
            <span className="font-semibold">{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
        </div>
      )
    }

    if (badge_category === 'tops' && 'efficiency_score' in metadata) {
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Score:</span>
            <span className="font-semibold">{metadata.efficiency_score.toFixed(4)}</span>
          </div>
        </div>
      )
    }

    if (badge_category === 'carrito_economy' && 'count' in metadata) {
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Economy:</span>
            <span className="font-semibold">{metadata.count} carritos</span>
          </div>
        </div>
      )
    }

    if (badge_category === 'carrito_business' && 'count' in metadata) {
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Business:</span>
            <span className="font-semibold">{metadata.count} carritos</span>
          </div>
        </div>
      )
    }

    if (badge_category === 'eficiencia' && 'improvements' in metadata) {
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div className="flex items-center justify-between">
            <span>Mejoras:</span>
            <span className="font-semibold">{metadata.improvements}</span>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl transition-all duration-200 border-2 ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      } ${getBadgeLevelColor(badge.badge_level)}`}
    >
      {/* Badge Icon */}
      <div className="text-center mb-2">
        <div className={`mx-auto ${iconSizes[size]} flex items-center justify-center relative`}>
          {!imageError ? (
            <Image
              src={badge.icon_path}
              alt={badge.title}
              width={size === 'large' ? 96 : size === 'medium' ? 64 : 48}
              height={size === 'large' ? 96 : size === 'medium' ? 64 : 48}
              className="object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl"></span> // Icomo de trofeo?
            </div>
          )}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h4 className={`font-bold mb-2 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
          {badge.title}
        </h4>
        <p className={`${size === 'small' ? 'text-[10px]' : 'text-xs'} opacity-80`}>
          {badge.description}
        </p>
        
        {renderMetadata()}

      </div>
    </div>
  )
}