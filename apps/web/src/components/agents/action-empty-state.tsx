import { SolarBoltBoldDuotone } from "@/assets/icons/bolt-duotone"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Link } from "@tanstack/react-router"
import { CreateActionDialog } from "./create-action-dialog"

export function ActionsEmptyState() {
  return (
    <Empty className="w-full mx-auto">
      <EmptyHeader>
        <SolarBoltBoldDuotone className="w-12 h-12" />
        <EmptyTitle className="text-xl font-semibold">Create your first action

        </EmptyTitle>
        <div className="w-full text-md text-center">
          Customize how your users interact with the chatbot by
          connecting to an integration
        </div>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <CreateActionDialog />
          <Link to="/admin/integrations">
            <Button variant="outline">View integrations</Button>
          </Link>
        </div>
      </EmptyContent>

    </Empty>
  )
}
