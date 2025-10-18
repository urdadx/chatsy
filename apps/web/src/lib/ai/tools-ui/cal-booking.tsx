import { CalAppointmentPicker } from "@/components/cal-appointment-picker"
import { api } from "@/lib/api"

interface CalBookingProps {
  eventTypeId: number
  eventTypeName?: string
  duration?: number
  name?: string
  description?: string
  color?: string
}

export function CalBooking({
  eventTypeId,
  eventTypeName,
  duration = 30,
}: CalBookingProps) {
  return (
    <CalAppointmentPicker
      eventTypeId={eventTypeId}
      eventTypeName={eventTypeName}
      duration={duration}
      onConfirm={async (payload) => {
        try {
          const response = await api.post('/cal/booking', {
            eventTypeId,
            start: payload.start,
            end: payload.end,
            attendee: {
              name: payload.attendeeName,
              email: payload.attendeeEmail,
            },
            notes: payload.notes,
          })

          if (response.data?.success) {
            // Optional: Show success message or redirect
            console.log('Booking created successfully:', response.data)
          }
        } catch (error) {
          console.error('Error creating booking:', error)
        }
      }}
    />
  )
}
