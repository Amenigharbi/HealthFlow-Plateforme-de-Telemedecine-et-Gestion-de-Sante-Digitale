'use client'
import { TimeSlot } from '@/types/appointment'

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  loading?: boolean
}

export default function TimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false
}: TimeSlotsProps) {
  const groupSlotsByHour = (slots: TimeSlot[]) => {
    const groups: { [key: string]: TimeSlot[] } = {}
    
    slots.forEach(slot => {
      const hour = slot.start.getHours()
      const key = `${hour}h-${hour + 1}h`
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(slot)
    })
    
    return groups
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const groupedSlots = groupSlotsByHour(slots)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chargement des créneaux...
        </h3>
        <div className="animate-pulse space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choisir un horaire
      </h3>

      {slots.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📅</div>
          <p className="text-gray-500">Aucun créneau disponible</p>
          <p className="text-sm text-gray-400">
            Choisissez une autre date ou un autre médecin
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedSlots).map(([hourRange, hourSlots]) => (
            <div key={hourRange}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                {hourRange}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {hourSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectSlot(slot)}
                    disabled={!slot.available}
                    className={`
                      p-3 rounded-xl border text-sm font-medium transition-all duration-200
                      ${selectedSlot === slot
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/20'
                        : slot.available
                        ? 'border-gray-200 text-gray-700 hover:border-cyan-300 hover:bg-cyan-25'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}