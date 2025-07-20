import { createFileRoute } from '@tanstack/react-router'
import { WebsiteSourceList } from '@/components/website-source-list'

export const Route = createFileRoute('/website-sources')({
  component: WebsiteSourcesComponent,
})

function WebsiteSourcesComponent() {
  return (
    <div className="p-4">
      <WebsiteSourceList />
    </div>
  )
}