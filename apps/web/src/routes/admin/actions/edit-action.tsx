import { CalendlyForm } from '@/components/agents/forms/calendly-form'
import { CustomButtonForm } from '@/components/agents/forms/custom-btn-form'
import { FeedbackForm } from '@/components/agents/forms/feedback-form'
import { ChatPreview } from '@/components/chat/chat-preview'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import z from 'zod'

const editActionSchema = z.object({
  actionId: z.string(),
  toolName: z.string(),
})

export const Route = createFileRoute('/admin/actions/edit-action')({
  component: RouteComponent,
  validateSearch: editActionSchema,
})

function RouteComponent() {
  const { actionId, toolName } = useSearch({ from: '/admin/actions/edit-action' })

  const getFormComponent = () => {
    switch (toolName) {
      case 'custom_button':
        return <CustomButtonForm actionId={actionId} />
      case 'calendly':
      case 'calendly_booking':
      case 'book_meeting':
        return <CalendlyForm actionId={actionId} />
      case 'feedback_form':
        return <FeedbackForm actionId={actionId} />
      default:
        return (
          <div className="w-full max-w-3xl bg-card rounded-lg border border-border shadow-xs p-6">
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground mb-2">
                Customize {toolName}
              </h1>
              <p className="text-sm text-muted-foreground">
                Form customization for "{toolName}" is coming soon.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-row h-full">
      <div className="flex-[2] flex h-full justify-center p-6 pr-8">
        {getFormComponent()}
      </div>

      <div className="flex-1 border-l hidden bg-gray-50 p-4 sm:flex justify-center items-center ">
        <div className="w-[400px]">
          <ChatPreview />
        </div>
      </div>
    </div>
  )
}
