import { CaldotComForm } from '@/components/agents/forms/caldotcom-form'
import { CalendlyForm } from '@/components/agents/forms/calendly-form'
import { CustomButtonForm } from '@/components/agents/forms/custom-btn-form'
import { FeedbackForm } from '@/components/agents/forms/feedback-form'
import { LeadsForm } from '@/components/agents/forms/leads-form'
import { ChatPreview } from '@/components/chat/chat-preview'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import { useState } from 'react'
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      case 'collect_leads':
        return <LeadsForm actionId={actionId} />
      case 'cal_booking':
        return <CaldotComForm actionId={actionId} />
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
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button className="flex sm:hidden rounded-full shadow-lg fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Eye className="w-5 h-5" />
            Preview
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[95%] px-2">
          <DrawerHeader>
            <DrawerTitle className="sr-only">Chat Preview</DrawerTitle>
          </DrawerHeader>
          <ChatPreview />
        </DrawerContent>
      </Drawer>
    </div>
  )
}
