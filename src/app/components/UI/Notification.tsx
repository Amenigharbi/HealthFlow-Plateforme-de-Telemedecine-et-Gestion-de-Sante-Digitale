'use client'
import { useEffect } from 'react'

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
  duration?: number
}

export default function Notification({
  type,
  message,
  onClose,
  duration = 5000
}: NotificationProps) {
  useEffect(() => {
    if (type !== 'error') { 
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [type, duration, onClose])

  const getStyles = () => {
    const baseStyles = "fixed top-4 right-4 p-4 rounded-xl shadow-lg border transform transition-all duration-300 z-50 max-w-sm"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
      default:
        return baseStyles
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '💡'
    }
  }

  return (
    <div className={getStyles()}>
      <div className="flex items-start space-x-3">
        <span className="text-lg">{getIcon()}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}