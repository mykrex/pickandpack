import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendValue,
  variant = 'primary' 
}: StatCardProps) {
  const variantClasses = {
    primary: 'bg-navy text-white border-navy',
    secondary: 'bg-white text-navy border-navy',
    accent: 'bg-gold-light text-navy border-gold',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  }

  return (
    <div className={`${variantClasses[variant]} border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-8 h-8" />
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-bold ${variant === 'primary' ? 'text-white' : trendColors[trend]}`}>
            <span>{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold mb-1 ${variant === 'primary' ? 'text-white' : 'text-navy'}`}>
          {value}
        </p>
        <p className={`text-sm font-medium ${variant === 'primary' ? 'text-gray-200' : 'text-gray-600'}`}>
          {label}
        </p>
      </div>
    </div>
  )
}