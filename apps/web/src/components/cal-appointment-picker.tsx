import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { endOfDay, format, startOfDay } from "date-fns"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

interface CalAppointmentPickerProps {
  eventTypeId?: number
  eventTypeName?: string
  duration?: number
  onConfirm?: (payload: {
    date: Date
    start: string
    end: string
    attendeeName: string
    attendeeEmail: string
    notes?: string
  }) => void
}

interface TimeSlot {
  time: string
  userIds: number[]
}

export function CalAppointmentPicker({
  eventTypeId,
  duration = 30,
  onConfirm,
}: CalAppointmentPickerProps) {
  const today = new Date()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showAttendeeForm, setShowAttendeeForm] = useState(false)

  // Form fields
  const [attendeeName, setAttendeeName] = useState("")
  const [attendeeEmail, setAttendeeEmail] = useState("")
  const [notes, setNotes] = useState("")

  // Fetch available slots using TanStack Query
  const { data: slotsData, isLoading: loading, error, refetch } = useQuery<{ slots: TimeSlot[] }>({
    queryKey: ["cal-slots", eventTypeId, date?.toISOString()],
    queryFn: async () => {
      if (!date || !eventTypeId) {
        return { slots: [] }
      }

      const startTime = startOfDay(date).toISOString()
      const endTime = endOfDay(date).toISOString()

      const response = await api.get("/cal/slots", {
        params: {
          eventTypeId,
          startTime,
          endTime,
        },
      })

      return response.data
    },
    enabled: !!date && !!eventTypeId,
    staleTime: 1000 * 60 * 5,
  })

  const timeSlots = slotsData?.slots || []

  const handleConfirm = async () => {
    if (!date || !selectedSlot || !attendeeName || !attendeeEmail) {
      return
    }

    const selectedDateTime = new Date(selectedSlot)
    const endDateTime = new Date(selectedDateTime.getTime() + duration * 60000)

    onConfirm?.({
      date,
      start: selectedDateTime.toISOString(),
      end: endDateTime.toISOString(),
      attendeeName,
      attendeeEmail,
      notes: notes || undefined,
    })
  }

  const isPastSelection = useMemo(() => {
    if (!selectedSlot) return false
    return new Date(selectedSlot) < new Date()
  }, [selectedSlot])

  return (
    <div>
      <div className="rounded-md border w-[320px]">
        {showAttendeeForm ? (
          <div className="p-6">
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAttendeeForm(false)
                  setShowTimePicker(true)
                }}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {date && format(date, "EEE, MMMM d")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedSlot && format(new Date(selectedSlot), "HH:mm")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>

              {isPastSelection && (
                <p className="text-xs text-amber-600">
                  The selected time is in the past. Please pick a future time.
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={!attendeeName || !attendeeEmail || isPastSelection}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
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
                  setSelectedSlot(null)
                  setShowTimePicker(true)
                }
              }}
              className="w-full"
              disabled={[{ before: today }]}
            />
            {!eventTypeId && (
              <p className="px-2 pb-2 text-xs text-muted-foreground">
                Select an event type to view availability.
              </p>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTimePicker(false)
                  setSelectedSlot(null)
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm text-center font-medium">
                {date && format(date, "EEEE, MMMM d")}
              </p>
              <div className="w-8" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-sm text-red-500 mb-2">
                  {error instanceof Error ? error.message : "Failed to load available time slots. Please try again."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No available slots for this date
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] w-full">
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedSlot === slot.time ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedSlot(slot.time)
                        setShowTimePicker(false)
                        setShowAttendeeForm(true)
                      }}
                    >
                      {format(new Date(slot.time), "HH:mm")}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
