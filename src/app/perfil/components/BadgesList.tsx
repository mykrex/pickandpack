import { Badge } from '@/components/ui/Badge'

interface BadgeData {
  id: number
  icon: string
  title: string
  description: string
  earned: boolean
  earnedDate?: string
}

interface BadgesListProps {
  badges: BadgeData[]
}

export function BadgesList({ badges }: BadgesListProps) {
  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏅 Medallas</h2>
        <span className="text-sm text-gray-600">
          {earnedBadges.length} de {badges.length} desbloqueadas
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Desbloqueadas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <Badge key={badge.id} {...badge} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Bloqueadas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge) => (
              <Badge key={badge.id} {...badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}