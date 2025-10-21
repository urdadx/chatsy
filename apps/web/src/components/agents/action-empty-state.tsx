import { SolarBoltBoldDuotone } from "@/assets/icons/bolt-duotone"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
} from "@/components/ui/empty"
import { Link } from "@tanstack/react-router"
import { CreateActionDialog } from "./create-action-dialog"

export function ActionsEmptyState() {
  return (
    <Empty className="w-full mx-auto">
      <EmptyHeader>
        <SolarBoltBoldDuotone className="w-12 h-12" />
        <div className="text-xl font-semibold">Create your first action

        </div>
        <div className="w-full text-md text-center max-w-3xl leading-relaxed">
          Customize how your users interact with the chatbot by creating actions that trigger specific responses or workflows.
        </div>
      </EmptyHeader>
      <div>
        <div className="flex gap-2">
          <CreateActionDialog />
          <Link to="/admin/integrations">
            <Button variant="outline">View integrations</Button>
          </Link>
        </div>
      </div>

    </Empty>
  )
}
