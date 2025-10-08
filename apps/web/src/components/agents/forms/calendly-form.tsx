import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Spinner from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatbot } from "@/hooks/use-chatbot"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

interface CalendlyFormProps {
  actionId?: string
}

export function CalendlyForm({ actionId }: CalendlyFormProps) {
  const { data: chatbot } = useChatbot()
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>(undefined)
  const [showInQuickMenu, setShowInQuickMenu] = useState(false)
  const router = useRouter()
  const isEditing = !!actionId

  // Fetch existing action data if editing
  const { data: existingAction, isLoading: isLoadingAction } = useQuery({
    queryKey: ["action", actionId],
    queryFn: async () => {
      if (!actionId) return null
      const response = await api.get(`/agent-actions/${actionId}`)
      return response.data
    },
    enabled: !!actionId,
  })

  useEffect(() => {
    if (existingAction) {
      setShowInQuickMenu(existingAction.showInQuickMenu || false)

      const props = existingAction.actionProperties
      if (props?.eventTypeUri) {
        setSelectedEventType(props.eventTypeUri)
      }
    }
  }, [existingAction])

  const { data: calendlySettings, isLoading: isLoadingCalendly, isError } = useQuery<{ chatbotId: string; calendlyAccount?: { connected: boolean; eventTypes?: any[] } }>({
    queryKey: ["calendly-settings", chatbot?.id],
    queryFn: async () => {
      const res = await api.get(`/integrations/calendly/settings/${chatbot!.id}`)
      return res.data
    },
    enabled: !!chatbot?.id,
    staleTime: 60_000,
  })

  const eventTypes = calendlySettings?.calendlyAccount?.eventTypes || []
  const calendlyConnected = !!calendlySettings?.calendlyAccount?.connected
  const showCalendlyTooltip = !isLoadingCalendly && !calendlyConnected

  return (
    <div className="w-full max-w-3xl bg-card rounded-lg border border-border shadow-xs">
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <Button
            variant="ghost"
            className="text-sm gap-2 px-2"
            type="button"
            aria-label="Go back"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Edit Calendly Meeting' : 'Book Calendly meetings'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Allow AI agent to automatically book meetings, call or demos with your customers
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input autoComplete="false" id="name" type="text" placeholder="Enter action name" className="w-full" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-types" className="text-sm font-medium">
            Select your preferred event type
          </Label>
          {showCalendlyTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={selectedEventType}
                    onValueChange={(val) => setSelectedEventType(val)}
                    disabled
                  >
                    <SelectTrigger id="event-types" className="w-full">
                      <SelectValue placeholder="Calendly not connected" />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent className="shadow-sm bg-white text-black" side="top">
                Connect Calendly in Integrations to load event types
              </TooltipContent>
            </Tooltip>
          ) : (
            <Select
              value={selectedEventType}
              onValueChange={(val) => setSelectedEventType(val)}
              disabled={isLoadingCalendly || !calendlyConnected || isError}
            >
              <SelectTrigger id="event-types" className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingCalendly
                      ? "Loading event types..."
                      : !calendlyConnected
                        ? "Calendly not connected"
                        : eventTypes.length === 0
                          ? "No event types found"
                          : "Select event type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCalendly && (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Spinner className="w-4 h-4" /> Loading...
                    </div>
                  </SelectItem>
                )}
                {!isLoadingCalendly && calendlyConnected && eventTypes.length === 0 && (
                  <SelectItem value="empty" disabled>
                    No event types available
                  </SelectItem>
                )}
                {eventTypes.map((et: any) => (
                  <SelectItem
                    key={et.uri || et.slug || et.name}
                    value={et.uri || et.slug || et.name}
                  >
                    {et.name || et.internal_name || et.slug || "Unnamed Event"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isError && (
            <p className="text-xs text-red-500">Failed to load Calendly event types.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description (when to trigger action)
          </Label>
          <Textarea
            autoComplete="false"
            id="description"
            placeholder="Example: Use this action when the user wants to schedule a meeting..."
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="enable-webhook" checked={showInQuickMenu} onCheckedChange={setShowInQuickMenu} />
          <Label htmlFor="show-quick-menu" className="text-sm font-medium cursor-pointer">
            Show in quick menu page on the chat widget
          </Label>
        </div>
      </div>

      <div className="border-t rounded-b-lg  bg-gray-50 border-border p-6 flex items-center justify-end gap-3">

        <Button className="text-sm">Create action</Button>
      </div>
    </div>
  )
}
