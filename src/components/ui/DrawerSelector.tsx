'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Drawer } from '@/types/database'

interface DrawerSelectorProps {
  selectedDrawer: string | null
  onSelectDrawer: (drawerId: string) => void
  disabled?: boolean
}

export function DrawerSelector({ selectedDrawer, onSelectDrawer, disabled }: DrawerSelectorProps) {
  const [drawers, setDrawers] = useState<Drawer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDrawers() {
      const { data, error } = await supabase
        .from('Drawers')
        .select('*')
        .order('Drawer_ID', { ascending: true })

      if (error) {
        console.error('Error fetching drawers:', error)
      } else {
        setDrawers(data || [])
      }
      setLoading(false)
    }

    fetchDrawers()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredDrawers = drawers.filter(drawer =>
    drawer.Drawer_ID.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedDrawerData = drawers.find(d => d.Drawer_ID === selectedDrawer)

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar Drawer
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-colors ${
          disabled
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : 'bg-white border-gray-300 hover:border-navy focus:border-navy'
        }`}
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-400" />
          {selectedDrawerData ? (
            <div className="text-left">
              <span className="font-semibold text-gray-900">{selectedDrawerData.Drawer_ID}</span>
              <span className="text-xs text-gray-500 ml-2">
                {selectedDrawerData.Flight_Type} • {selectedDrawerData.Drawer_Category}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Selecciona un drawer...</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Búsqueda */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar drawer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-navy text-sm"
              />
            </div>
          </div>

          {/* Lista de drawers */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando drawers...
              </div>
            ) : filteredDrawers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No se encontraron drawers
              </div>
            ) : (
              filteredDrawers.map((drawer) => (
                <button
                  key={drawer.Drawer_ID}
                  onClick={() => {
                    onSelectDrawer(drawer.Drawer_ID)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedDrawer === drawer.Drawer_ID ? 'bg-navy/5' : ''
                  }`}
                >
                  <div className="font-semibold text-gray-900">{drawer.Drawer_ID}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {drawer.Flight_Type} • {drawer.Drawer_Category}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}