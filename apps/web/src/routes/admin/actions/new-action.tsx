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


const actionTypeSchema = z.object({
  actionType: z.enum(['calendly', 'custom-button', "feedback_form", "collect_leads", "cal_booking"]).optional(),
})

export const Route = createFileRoute('/admin/actions/new-action')({
  component: RouteComponent,
  validateSearch: actionTypeSchema,
})

function RouteComponent() {
  const { actionType } = useSearch({ from: '/admin/actions/new-action' })
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getFormComponent = () => {
    switch (actionType) {
      case 'calendly':
        return <CalendlyForm />
      case 'custom-button':
        return <CustomButtonForm />
      case 'feedback_form':
        return <FeedbackForm />
      case 'collect_leads':
        return <LeadsForm />
      case 'cal_booking':
        return <CaldotComForm />
      default:
        return (
          <div className="text-center text-gray-500">
            Select an action type to create
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
