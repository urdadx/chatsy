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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FormSkeleton } from "./form-skeleton"

interface CalendlyFormProps {
  actionId?: string
}

export function CalendlyForm({ actionId }: CalendlyFormProps) {
  const { data: chatbot } = useChatbot()
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>(undefined)
  const [showInQuickMenu, setShowInQuickMenu] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditing = !!actionId

  const { data: existingAction, isLoading } = useQuery({
    queryKey: ["action", actionId],
    queryFn: async () => {
      if (!actionId) return null
      const response = await api.get(`/agent-actions/${actionId}`)
      return response.data?.action ?? null
    },
    enabled: !!actionId,
  })

  useEffect(() => {
    if (existingAction) {
      setName(existingAction.name || "")
      setDescription(existingAction.description || "")
      setShowInQuickMenu(existingAction.showInQuickMenu || false)

      const props = existingAction.actionProperties
      if (props?.eventTypeUri) {
        setSelectedEventType(props.eventTypeUri)
      }
    }
  }, [existingAction])

  const { data: calendlySettings, isLoading: isLoadingCalendly, isError } = useQuery<{
    chatbotId: string;
    calendlyAccount?: {
      connected: boolean;
      eventTypes?: any[];
      userEmail?: string;
    }
  }>({
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
  const userEmail = calendlySettings?.calendlyAccount?.userEmail

  const selectedEventTypeData = eventTypes.find((et: any) => et.uri === selectedEventType)

  useEffect(() => {
    const uri = existingAction?.actionProperties?.eventTypeUri
    if (!uri) return
    if (!selectedEventType && eventTypes.length > 0) {
      const exists = eventTypes.some((et: any) => et?.uri === uri)
      if (exists) setSelectedEventType(uri)
    }
  }, [existingAction, eventTypes, selectedEventType])

  const createActionMutation = useMutation({
    mutationFn: async (data: {
      name: string
      description: string
      eventTypeUri: string
      eventTypeName: string
      userEmail?: string
      showInQuickMenu: boolean
    }) => {
      const payload = {
        name: data.name,
        description: data.description,
        toolName: "calendly_booking",
        showInQuickMenu: data.showInQuickMenu,
        actionProperties: {
          eventTypeUri: data.eventTypeUri,
          eventTypeName: data.eventTypeName,
          userEmail: data.userEmail,
        },
      }

      if (isEditing) {
        const response = await api.put(`/agent-actions/${actionId}`, payload)
        return response.data
      }

      const response = await api.post("/agent-actions", payload)
      return response.data
    },
    onSuccess: () => {
      toast.success(isEditing ? "Calendly action updated successfully" : "Calendly action created successfully")
      queryClient.invalidateQueries({ queryKey: ["actions"] })
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["action", actionId] })
      }
      router.history.back()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save Calendly action")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a name for the action")
      return
    }

    if (!description.trim()) {
      toast.error("Please enter a description for the action")
      return
    }

    if (!selectedEventType) {
      toast.error("Please select an event type")
      return
    }

    if (!selectedEventTypeData) {
      toast.error("Selected event type not found")
      return
    }

    await createActionMutation.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      eventTypeUri: selectedEventType,
      eventTypeName: getEventTypeSlug(selectedEventTypeData),
      userEmail,
      showInQuickMenu,
    })
  }

  // Extract event type name/slug for URL
  const getEventTypeSlug = (eventType: any) => {
    if (eventType?.slug) return eventType.slug
    if (eventType?.name) {
      return eventType.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }
    return 'meeting'
  }

  const deleteActionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/agent-actions/${actionId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Action deleted")
      queryClient.invalidateQueries({ queryKey: ["actions"] })
      router.history.back()
    },
    onError: () => {
      toast.error(
        "Failed to delete action. Please try again."
      )
    }
  })

  if (isLoading) {
    return (
      <FormSkeleton />
    )
  }
  return (
    <form onSubmit={handleSubmit} className="w-full h-fit max-w-3xl bg-card rounded-lg border border-border shadow-xs">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-sm"
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

          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            autoComplete="off"
            id="name"
            type="text"
            placeholder="Enter action name"
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
                {eventTypes.map((et: any) => {
                  const value: string | undefined = et?.uri
                  if (!value) return null
                  return (
                    <SelectItem key={value} value={value}>
                      {et.name || et.internal_name || et.slug || "Unnamed Event"}
                    </SelectItem>
                  )
                })}
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
            autoComplete="off"
            id="description"
            placeholder="Example: Use this action when the user wants to schedule a meeting..."
            className="w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="show-quick-menu" checked={showInQuickMenu} onCheckedChange={setShowInQuickMenu} />
          <Label htmlFor="show-quick-menu" className="text-sm font-medium cursor-pointer">
            Show in quick menu page on the chat widget
          </Label>
        </div>
      </div>

      <div className="border-t rounded-b-lg  border-border p-6 flex items-center justify-end gap-3">
        {isEditing && (
          <Button
            onClick={() => deleteActionMutation.mutate()}
            variant="outline"
            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-200"
            type="button"
            disabled={deleteActionMutation.isPending}
          >
            {deleteActionMutation.isPending ? (
              <>
                <Spinner className="text-red-500" />
                Deleting
              </>
            ) : (
              "Delete action"
            )}
          </Button>
        )}
        <Button
          type="submit"
          className="text-sm"
          disabled={createActionMutation.isPending || !selectedEventType || !name.trim() || !description.trim()}
        >
          {createActionMutation.isPending ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Update action" : "Create action"
          )}
        </Button>
      </div>
    </form>
  )
}
