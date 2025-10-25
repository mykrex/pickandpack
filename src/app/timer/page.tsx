'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'

export default function TimerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)

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

  const handleStart = () => setIsRunning(true)
  const handleStop = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
  }

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

            {/* Display del cronómetro */}
            <div className="bg-gray-100 rounded-xl p-8 mb-8">
              <div className="text-6xl font-mono font-bold text-gray-900">
                {formatTime()}
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Comenzar
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Parar
                </button>
              )}

              {time > 0 && (
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reiniciar
                </button>
              )}
            </div>

            {/* Estado */}
            <div className="mt-6 p-4 bg-navy/5 rounded-lg">
              <p className="text-sm text-navy font-medium">
                Estado: {isRunning ? '🟢 En marcha' : '🔴 Detenido'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}