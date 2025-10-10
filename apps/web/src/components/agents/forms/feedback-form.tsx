import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Spinner from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useChatbot } from "@/hooks/use-chatbot"
import { api } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FormSkeleton } from "./form-skeleton"

interface FeedbackFormProps {
  actionId?: string
}

export function FeedbackForm({ actionId }: FeedbackFormProps) {
  const { data: chatbot } = useChatbot()
  const [showInQuickMenu, setShowInQuickMenu] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [emailLabel, setEmailLabel] = useState("Email")
  const [subjectLabel, setSubjectLabel] = useState("Subject")
  const [messageLabel, setMessageLabel] = useState("Message")
  const [submitButtonText, setSubmitButtonText] = useState("Submit Feedback")
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditing = !!actionId

  const { data: action, isLoading: isLoadingAction } = useQuery({
    queryKey: ["action", actionId],
    queryFn: () => api.get(`/api/actions/${actionId}`).then(res => res.data),
    enabled: !!actionId,
  })

  useEffect(() => {
    if (action && isEditing) {
      setName(action.name || "")
      setDescription(action.description || "")
      setShowInQuickMenu(action.showInQuickMenu || false)

      const settings = action.settings || {}
      setEmailLabel(settings.emailLabel || "Email")
      setSubjectLabel(settings.subjectLabel || "Subject")
      setMessageLabel(settings.messageLabel || "Message")
      setSubmitButtonText(settings.submitButtonText || "Submit Feedback")
    }
  }, [action, isEditing])

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/actions", data).then(res => res.data)
    },
    onSuccess: () => {
      toast.success("Feedback form created successfully!")
      queryClient.invalidateQueries({ queryKey: ["actions"] })
      router.navigate({ to: "/admin/actions" })
    },
    onError: (error) => {
      console.error("Error creating feedback form:", error)
      toast.error("Failed to create feedback form")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put(`/api/actions/${actionId}`, data).then(res => res.data)
    },
    onSuccess: () => {
      toast.success("Feedback form updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["actions"] })
      queryClient.invalidateQueries({ queryKey: ["action", actionId] })
      router.navigate({ to: "/admin/actions" })
    },
    onError: (error) => {
      console.error("Error updating feedback form:", error)
      toast.error("Failed to update feedback form")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a name for the feedback form")
      return
    }

    const actionData = {
      name,
      description,
      toolName: "feedback_form",
      showInQuickMenu,
      settings: {
        emailLabel,
        subjectLabel,
        messageLabel,
        submitButtonText,
      },
      chatbotId: chatbot?.id,
    }

    if (isEditing) {
      updateMutation.mutate(actionData)
    } else {
      createMutation.mutate(actionData)
    }
  }

  if (isLoadingAction && isEditing) {
    return <FormSkeleton />
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full max-w-3xl bg-card rounded-lg border border-border shadow-xs">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.navigate({ to: "/admin/actions" })}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit" : "Create"} Feedback Form
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update" : "Create"} a feedback collection form for your chatbot
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Action Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer Feedback Form"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this feedback form"
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-base font-medium text-foreground mb-4">Form Configuration</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emailLabel" className="text-sm font-medium">
                  Email Field Label
                </Label>
                <Input
                  id="emailLabel"
                  value={emailLabel}
                  onChange={(e) => setEmailLabel(e.target.value)}
                  placeholder="Email"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subjectLabel" className="text-sm font-medium">
                  Subject Field Label
                </Label>
                <Input
                  id="subjectLabel"
                  value={subjectLabel}
                  onChange={(e) => setSubjectLabel(e.target.value)}
                  placeholder="Subject"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="messageLabel" className="text-sm font-medium">
                Message Field Label
              </Label>
              <Input
                id="messageLabel"
                value={messageLabel}
                onChange={(e) => setMessageLabel(e.target.value)}
                placeholder="Message"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="submitButtonText" className="text-sm font-medium">
                Submit Button Text
              </Label>
              <Input
                id="submitButtonText"
                value={submitButtonText}
                onChange={(e) => setSubmitButtonText(e.target.value)}
                placeholder="Submit Feedback"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showInQuickMenu" className="text-sm font-medium">
                Show in Quick Menu
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Display this action in the chatbot's quick access menu
              </p>
            </div>
            <Switch
              id="showInQuickMenu"
              checked={showInQuickMenu}
              onCheckedChange={setShowInQuickMenu}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.navigate({ to: "/admin/actions" })}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Spinner className="w-4 h-4 mr-2" />}
            {isEditing ? "Update" : "Create"} Form
          </Button>
        </div>
      </form>
    </div>
  )
}
