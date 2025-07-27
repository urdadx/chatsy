import { WebsiteSourceList } from "@/components/knowledge-base/website-source/website-source-list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/website-sources")({
  component: WebsiteSourcesComponent,
});

function WebsiteSourcesComponent() {
  return (
    <div className="p-4">
      <WebsiteSourceList />
    </div>
  );
}
