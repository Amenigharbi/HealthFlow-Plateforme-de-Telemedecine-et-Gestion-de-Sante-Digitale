// components/Appointment/DateCalendar.tsx
'use client'
import { useState } from 'react'

interface DateCalendarProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  availableDates: Date[]
}

export default function DateCalendar({
  selectedDate,
  onSelectDate,
  availableDates
}: DateCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      availableDate.toDateString() === date.toDateString()
    )
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({ date: day, isCurrentMonth: false })
    }

    // Jours du mois courant
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i)
      days.push({ date: day, isCurrentMonth: true })
    }

    // Jours du mois suivant
    const totalCells = 42 // 6 semaines
    const nextMonthDays = totalCells - days.length
    for (let i = 1; i <= nextMonthDays; i++) {
      const day = new Date(year, month + 1, i)
      days.push({ date: day, isCurrentMonth: false })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newMonth
    })
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth }, index) => {
          const available = isDateAvailable(date)
          const selected = selectedDate && isSameDay(date, selectedDate)
          const today = isSameDay(date, new Date())

          return (
            <button
              key={index}
              onClick={() => available && onSelectDate(date)}
              disabled={!available || !isCurrentMonth}
              className={`
                h-12 rounded-xl text-sm font-medium transition-all duration-200
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${selected
                  ? 'bg-cyan-500 text-white shadow-lg transform scale-105'
                  : today
                  ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                  : available
                  ? 'text-gray-700 hover:bg-cyan-50 hover:border-cyan-200 hover:border'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}