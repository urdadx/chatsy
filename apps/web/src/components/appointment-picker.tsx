import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addHours, format, setHours, setMinutes } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useMemo, useState } from "react"

interface AppointmentPickerProps {
  eventTypeUri?: string
  eventTypeName?: string
  userEmail?: string
  onConfirm?: (payload: { date: Date; start: string; end: string; calendlyUrl: string }) => void
}

export function AppointmentPicker({ eventTypeUri, eventTypeName, userEmail, onConfirm }: AppointmentPickerProps) {
  const today = new Date()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number } | null>(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          hour,
          minute,
          label: format(setMinutes(setHours(new Date(), hour), minute), "HH:mm")
        })
      }
    }
    return slots
  }, [])

  const selectedTimeLabel = useMemo(() => {
    if (!selectedTime) return null
    return format(setMinutes(setHours(new Date(), selectedTime.hour), selectedTime.minute), "HH:mm")
  }, [selectedTime])

  const isPastSelection = useMemo(() => {
    if (!date || !selectedTime) return false
    const dt = setMinutes(setHours(new Date(date), selectedTime.hour), selectedTime.minute)
    return dt < new Date()
  }, [date, selectedTime])

  const generateCalendlyUrl = () => {
    if (!date || !selectedTime || !userEmail || !eventTypeName) {
      console.log("Missing required data for Calendly URL:", {
        date: !!date,
        selectedTime: !!selectedTime,
        userEmail: !!userEmail,
        eventTypeName: !!eventTypeName
      });
      return null;
    }

    // Create the datetime for the selected slot
    const selectedDateTime = setMinutes(setHours(new Date(date), selectedTime.hour), selectedTime.minute)

    // Format the datetime for Calendly URL (ISO format with +00:00 timezone)
    const isoDateTime = selectedDateTime.toISOString().replace(/\.000Z$/, '+00:00')

    // Extract username from email (part before @)
    const username = userEmail.split('@')[0]

    const calendlyUrl = `https://calendly.com/${username}/${eventTypeName}/${isoDateTime}`;
    console.log("Generated Calendly URL:", calendlyUrl);

    return calendlyUrl;
  }

  return (
    <div>
      <div className="rounded-md border w-[270px]">
        {showConfirmation ? (
          <div className="p-8 text-center">
            <p className="mb-2 text-md">
              Meeting set for{" "}
              <span className="">
                {date && format(date, "EEE, MMMM d")} {selectedTimeLabel ? `at ${selectedTimeLabel}` : ""}
              </span>
            </p>
            {isPastSelection && (
              <p className="mb-4 text-xs text-amber-600">
                The selected time is in the past. Please pick a future time.
              </p>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (date && selectedTime) {
                  const selectedDateTime = setMinutes(setHours(new Date(date), selectedTime.hour), selectedTime.minute)
                  const endDateTime = addHours(selectedDateTime, 1)
                  const calendlyUrl = generateCalendlyUrl()

                  if (calendlyUrl) {
                    onConfirm?.({
                      date,
                      start: selectedDateTime.toISOString(),
                      end: endDateTime.toISOString(),
                      calendlyUrl
                    })
                  }
                }
              }}
              disabled={!selectedTime || !date}
            >
              Confirm meeting
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 block w-full"
              onClick={() => {
                setShowConfirmation(false)
                setShowTimePicker(true)
              }}
            >
              ← Change time
            </Button>
          </div>
        ) : !showTimePicker ? (
          <div className="p-2 w-full">
            <Calendar
              mode="single"
              selected={date}
              modifiers={{ weekend: { dayOfWeek: [0, 6] } }}
              modifiersClassNames={{ weekend: "line-through opacity-60" }}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate)
                  setSelectedTime(null)
                  setShowTimePicker(true)
                }
              }}
              className="w-full"
              disabled={[{ before: today }]}
            />
            {!eventTypeUri && (
              <p className="px-2 pb-2 text-xs text-muted-foreground">Select an event type to view availability.</p>
            )}
            {(!userEmail || !eventTypeName) && eventTypeUri && (
              <div className="mx-2 mb-2 p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Missing data:</strong> {!userEmail && "User email"} {!userEmail && !eventTypeName && " and "} {!eventTypeName && "Event type name"} required for Calendly booking.
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setShowTimePicker(false)}>
                <ArrowLeft className=" h-4 w-4" />
              </Button>
              <p className="text-sm text-center font-medium">{date && format(date, "EEEE, MMMM d")}</p>
              <div className="w-8" />
            </div>
            <ScrollArea className="h-fit w-full">
              <div className="grid gap-1.5 sm:grid-cols-2">
                {timeSlots.map(({ hour, minute, label }) => (
                  <Button
                    key={`${hour}-${minute}`}
                    variant={selectedTime?.hour === hour && selectedTime?.minute === minute ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedTime({ hour, minute })
                      setShowConfirmation(true)
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
