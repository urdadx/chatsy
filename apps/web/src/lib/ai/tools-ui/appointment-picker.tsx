"use client"

import { format } from "date-fns"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Component() {
  const today = new Date()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | null>(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Mock time slots data
  const timeSlots = [
    { time: "09:00", available: false },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
  ]

  return (
    <div>
      <div className="rounded-md border">
        {showConfirmation ? (
          <div className="p-8 text-center">
            <p className="mb-6 text-lg">
              You scheduled a meeting for{" "}
              <span className="font-semibold">
                {date && format(date, "EEE, MMMM d")} at {time}
              </span>
            </p>
            <Button
              size="lg"
              onClick={() => {
                console.log("[v0] Appointment confirmed:", { date, time })
                // Handle confirmation logic here
              }}
            >
              Confirm Appointment
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
          <div className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate)
                  setTime(null)
                  setShowTimePicker(true)
                }
              }}
              disabled={[{ before: today }]}
            />
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setShowTimePicker(false)}>

              </Button>
              <p className="text-sm font-medium">{date && format(date, "EEEE, MMMM d")}</p>
            </div>
            <ScrollArea className="h-96">
              <div className="grid gap-1.5 sm:grid-cols-2">
                {timeSlots.map(({ time: timeSlot, available }) => (
                  <Button
                    key={timeSlot}
                    variant={time === timeSlot ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setTime(timeSlot)
                      setShowConfirmation(true)
                    }}
                    disabled={!available}
                  >
                    {timeSlot}
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
