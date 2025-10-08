import { CalendlyForm } from '@/components/agents/forms/calendly-form'
import { CustomButtonForm } from '@/components/agents/forms/custom-btn-form'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import z from 'zod'


const actionTypeSchema = z.object({
  actionType: z.enum(['calendly', 'custom-button', "feedback_form"]),
})

export const Route = createFileRoute('/admin/actions/new-action')({
  component: RouteComponent,
  validateSearch: actionTypeSchema,
})

function RouteComponent() {

  const { actionType } = useSearch({ from: '/admin/actions/new-action' })

  return (
    <div className="flex flex-col justify-center p-4">
      <div className="flex justify-center">
        {
          actionType === 'calendly' ? (
            <CalendlyForm />
          ) : actionType === 'custom-button' ? (
            <CustomButtonForm />
          ) : <div className="text-center text-gray-500">Select an action type to create</div>
        }

      </div>
    </div>
  )
}
