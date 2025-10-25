interface User {
  id: number
  Name: string
  email?: string
  role?: string
  joinDate?: string
}

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-gray-100">
      <div className="flex items-center space-x-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-gold shadow-lg">
            {user.Name ? user.Name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-7 h-7 rounded-full border-4 border-white"></div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-navy mb-1">
            {user.Name || 'Sin nombre'}
          </h1>
          <p className="text-gray-600 mb-2">
            {user.email || 'usuario@pickandpack.com'}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-navy text-white px-3 py-1 rounded-full font-medium">
              {user.role || 'Operador'}
            </span>
            <span className="text-gray-500">
              Miembro desde: {user.joinDate || 'Oct 2024'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="text-center px-6 border-l-2 border-gray-200">
          <div className="text-3xl font-bold text-gold">12</div>
          <div className="text-sm text-gray-600 font-medium">Medallas</div>
        </div>
      </div>
    </div>
  )
}