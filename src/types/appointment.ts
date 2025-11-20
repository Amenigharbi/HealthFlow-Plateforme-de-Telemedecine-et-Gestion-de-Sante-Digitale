// types/appointment.ts
export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: Date
  duration: number
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  type: 'consultation' | 'followup' | 'emergency'
  reason: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  doctor?: {
    name: string
    specialty: string
    email: string
  }
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  appointmentId?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  phone?: string
  avatar?: string
  availability: Availability[]
}

export interface Availability {
  dayOfWeek: number // 0-6 (dimanche-samedi)
  startTime: string // "09:00"
  endTime: string   // "17:00"
  breaks: { start: string; end: string }[]
}