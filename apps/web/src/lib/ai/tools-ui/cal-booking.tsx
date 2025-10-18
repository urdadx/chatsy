import { CalAppointmentPicker } from "@/components/cal-appointment-picker"
import { api } from "@/lib/api"

interface CalBookingProps {
  username: string
  eventSlug: string
  eventTypeName?: string
  duration?: number
  name?: string
  description?: string
  color?: string
}

export function CalBooking({
  username,
  eventSlug,
  eventTypeName,
  duration = 30,
}: CalBookingProps) {
  return (
    <CalAppointmentPicker
      username={username}
      eventSlug={eventSlug}
      eventTypeName={eventTypeName}
      duration={duration}
      onConfirm={async (payload) => {
        try {
          const response = await api.post('/cal/booking', {
            username,
            eventSlug,
            start: payload.start,
            end: payload.end,
            attendee: {
              name: payload.attendeeName,
              email: payload.attendeeEmail,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
