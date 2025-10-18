import { AppointmentPicker } from "@/components/appointment-picker"

interface CalendlyBookingProps {
  eventTypeUri: string
  eventTypeName?: string
  userEmail?: string
  name?: string
  description?: string
  color?: string
}

export function CalendlyBooking({
  eventTypeUri,
  eventTypeName,
  userEmail,
}: CalendlyBookingProps) {
  return (

    <AppointmentPicker
      eventTypeUri={eventTypeUri}
      eventTypeName={eventTypeName}
      userEmail={userEmail}
      onConfirm={(payload) => {
        if (payload.calendlyUrl) {
          window.open(payload.calendlyUrl, '_blank', 'noopener,noreferrer')
        }
      }}
    />
  )
}
