import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/admin/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/test"!</div>
}
