import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/organization/customer-state')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/organization/customer-state"!</div>
}
