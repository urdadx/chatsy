import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/chat-history/$historyId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/conversations/$conversationId"!</div>
}
