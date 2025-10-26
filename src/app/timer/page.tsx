'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Save, CheckCircle } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { DrawerSelector } from '@/components/ui/DrawerSelector'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

export default function TimerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [selectedDrawer, setSelectedDrawer] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const user = getCurrentUser()
  const supabase = createClient()

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 10)
      }, 10)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = () => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    const milliseconds = Math.floor((time % 1000) / 10)

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`
  }

  const getDurationInSeconds = () => {
    return Math.floor(time / 1000)
  }

  const handleStart = () => {
    if (selectedDrawer) {
      setIsRunning(true)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleResetConfirm = () => {
    setShowResetDialog(false)
    setIsRunning(false)
    setTime(0)
  }

  const handleReset = () => {
    if (time > 0) {
      setShowResetDialog(true)
    }
  }

  const handleSaveConfirm = async () => {
    setShowSaveDialog(false)
    setIsSaving(true)

    try {
      const duration = getDurationInSeconds()

      const { error } = await supabase
        .from('Records')
        .insert({
          drawers_id: selectedDrawer,
          users_id: user?.id || 10,
          duration: duration
        })

      if (error) {
        console.error('Error al guardar:', error)
        alert('Error al guardar el registro')
      } else {
        // Mostrar mensaje de éxito
        setShowSuccessMessage(true)
        
        // Resetear el timer
        setTime(0)
        setSelectedDrawer(null)
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error al guardar el registro')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    if (time > 0 && !isRunning) {
      setShowSaveDialog(true)
    }
  }

  const canStart = selectedDrawer !== null && !isRunning && time === 0
  const canStop = isRunning
  const canReset = time > 0 && !isRunning
  const canSave = time > 0 && !isRunning

  return (
    <>
      <TopNav />
      
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            {/* Icono */}
            <div className="w-16 h-16 bg-navy rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">⏱️</span>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Timer
            </h1>

            <p className="text-gray-600 mb-8">
              Registra tu tiempo de trabajo
            </p>

            {/* Selector de Drawer */}
            <div className="mb-6">
              <DrawerSelector
                selectedDrawer={selectedDrawer}
                onSelectDrawer={setSelectedDrawer}
                disabled={isRunning || time > 0}
              />
            </div>

            {/* Display del cronómetro */}
            <div className="bg-gray-100 rounded-xl p-8 mb-8">
              <div className="text-6xl font-mono font-bold text-gray-900">
                {formatTime()}
              </div>
            </div>

            {/* Mensaje de éxito */}
            {showSuccessMessage && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg flex items-center gap-3 animate-in fade-in">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-green-700 font-semibold">¡Registro guardado exitosamente!</span>
              </div>
            )}

            {/* Botones */}
            <div className="space-y-3">
              {/* Iniciar/Parar */}
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  disabled={!canStart}
                  className={`w-full py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold ${
                    canStart
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  disabled={!canStop}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Parar
                </button>
              )}

              {/* Reiniciar */}
              <button
                onClick={handleReset}
                disabled={!canReset}
                className={`w-full py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold ${
                  canReset
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
                Reiniciar
              </button>

              {/* Guardar */}
              <button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className={`w-full py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold ${
                  canSave && !isSaving
                    ? 'bg-navy hover:bg-navy-light text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        isOpen={showSaveDialog}
        title="Confirmar guardado"
        message={`¿Seguro que deseas guardar este tiempo de ${formatTime().slice(0, -3)} para el drawer ${selectedDrawer}?`}
        confirmText="Sí, guardar"
        cancelText="Cancelar"
        onConfirm={handleSaveConfirm}
        onCancel={() => setShowSaveDialog(false)}
        type="info"
      />

      <ConfirmDialog
        isOpen={showResetDialog}
        title="Confirmar reinicio"
        message="¿Seguro que deseas reiniciar el tiempo? Se perderá el tiempo actual."
        confirmText="Sí, reiniciar"
        cancelText="Cancelar"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetDialog(false)}
        type="warning"
      />
    </>
  )
}