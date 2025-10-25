interface BadgeProps {
  icon: string
  title: string
  description: string
  earned: boolean
  earnedDate?: string
}

export function Badge({ icon, title, description, earned, earnedDate }: BadgeProps) {
  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-200 ${
        earned
          ? 'bg-white border-2 border-gold shadow-md hover:shadow-lg'
          : 'bg-gray-50 border-2 border-gray-200 opacity-60'
      }`}
    >
      {/* Badge Icon */}
      <div className="text-center mb-2">
        <div
          className={`text-5xl mx-auto w-20 h-20 flex items-center justify-center rounded-full ${
            earned ? 'bg-gold-light' : 'bg-gray-200'
          }`}
        >
          {earned ? icon : '🔒'}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h4 className={`font-bold text-sm mb-1 ${earned ? 'text-navy' : 'text-gray-500'}`}>
          {title}
        </h4>
        <p className={`text-xs ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {description}
        </p>
        {earned && earnedDate && (
          <p className="text-xs text-gold-dark mt-2 font-medium">
            {earnedDate}
          </p>
        )}
      </div>

      {/* Shine effect for earned badges */}
      {earned && (
        <div className="absolute top-2 right-2">
          <span className="text-gold text-xl">✨</span>
        </div>
      )}
    </div>
  )
}