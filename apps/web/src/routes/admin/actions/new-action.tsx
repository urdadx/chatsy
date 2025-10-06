import { CalendlyForm } from '@/components/agents/forms/calendly-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/actions/new-action')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center p-4">
      <div className="flex justify-center">
        <CalendlyForm />
      </div>
    </div>
  )
}
