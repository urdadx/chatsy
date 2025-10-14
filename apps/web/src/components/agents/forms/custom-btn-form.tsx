import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Spinner from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FormSkeleton } from "./form-skeleton"

interface CustomButtonFormProps {
  actionId?: string
}

export function CustomButtonForm({ actionId }: CustomButtonFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditing = !!actionId

  const { data: existingAction, isLoading: isLoadingAction } = useQuery({
    queryKey: ["action", actionId],
    queryFn: async () => {
      if (!actionId) return null
      const response = await api.get(`/agent-actions/${actionId}`)
      return response.data?.action ?? null
    },
    enabled: !!actionId,
  })

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [destinationUrl, setDestinationUrl] = useState("")
  const [showInQuickMenu, setShowInQuickMenu] = useState(false)

  useEffect(() => {
    if (existingAction) {
      setName(existingAction.name || "")
      setDescription(existingAction.description || "")
      setShowInQuickMenu(existingAction.showInQuickMenu || false)

      const props = existingAction.actionProperties
      if (props) {
        setButtonText(props.buttonText || "")
        setDestinationUrl(props.buttonUrl || "")
      }
    }
  }, [existingAction])

  const createActionMutation = useMutation({
    mutationFn: async (actionData: {
      name: string
      description: string
      toolName: string
      showInQuickMenu: boolean
      actionProperties: {
        buttonText: string
        buttonUrl: string
      }
    }) => {
      if (isEditing) {
        const response = await api.put(`/agent-actions/${actionId}`, actionData)
        return response.data
      }

      const response = await api.post("/agent-actions", actionData)
      return response.data
    },
    onSuccess: () => {
      toast.success("successful")
      queryClient.invalidateQueries({ queryKey: ["actions"] })
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["action", actionId] })
      }
      router.history.back()
    },
    onError: () => {
      toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} action`
      )
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.warning("Please enter a name for the action")
      return
    }

    if (!description.trim()) {
      toast.warning("Please enter a description for the action")
      return
    }

    if (!buttonText.trim()) {
      toast.warning("Please enter button text")
      return
    }

    if (!destinationUrl.trim()) {
      toast.warning("Please enter a destination URL")
      return
    }

    createActionMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      toolName: "custom_button",
      showInQuickMenu,
      actionProperties: {
        buttonText: buttonText.trim(),
        buttonUrl: destinationUrl.trim()
      }
    })
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

  if (isLoadingAction) {
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
              {isEditing ? 'Edit Custom Button' : 'Custom Button'}
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
            autoComplete="false"
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
          <Label htmlFor="description" className="text-sm font-medium">
            Description (when to trigger action)
          </Label>
          <Textarea
            autoComplete="false"
            id="description"
            placeholder="Example: Use this action when the user wants to visit my website..."
            className="w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-text" className="text-sm font-medium">
            Button text
          </Label>
          <Input
            autoComplete="false"
            id="button-text"
            type="text"
            placeholder="Enter text displayed on button"
            className="w-full"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-medium">
            Destination URL
          </Label>
          <Input
            autoComplete="false"
            id="url"
            type="url"
            placeholder="Enter the URL to open when button is clicked"
            className="w-full"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="show-quick-menu"
            checked={showInQuickMenu}
            onCheckedChange={setShowInQuickMenu}
          />
          <Label htmlFor="show-quick-menu" className="text-sm font-medium cursor-pointer">
            Show in quick menu page on the chat widget
          </Label>
        </div>
      </div>

      <div className="border-t rounded-b-lg border-border p-4 flex items-center justify-end gap-3">
        {
          isEditing && (
            <Button
              variant="outline"
              onClick={() => deleteActionMutation.mutate()}
              className="text-sm text-red-500 hover:bg-red-50 hover:text-red-400"
              type="button" >
              {
                deleteActionMutation.isPending ? (
                  <>
                    <Spinner className="text-red-500" />
                    Deleting
                  </>
                ) : (
                  "Delete action"
                )
              }
            </Button>
          )
        }

        <Button
          type="submit"
          className="text-sm"
          disabled={createActionMutation.isPending}
        >
          {createActionMutation.isPending ? (
            <>
              <Spinner className="text-white mr-2" />
              {isEditing ? 'Updating' : 'Creating'}
            </>
          ) : (
            isEditing ? 'Update action' : 'Create action'
          )}
        </Button>
      </div>
    </form>
  )
}
