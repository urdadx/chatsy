import CalendlyIcon from "@/assets/calendly.png"
import { SolarBoltBoldDuotone } from "@/assets/icons/bolt-duotone"
import { SolarBoxMinimalisticBoldDuotone } from "@/assets/icons/box-icon"
import { SolarClipboardBoldDuotone } from "@/assets/icons/clipboard-icon"
import { SolarMagniferBoldDuotone } from "@/assets/icons/glass-search-icon"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"

interface ActionCardProps {
  href: string
  icon?: React.ReactNode
  title: string
  description: string
  iconSrc?: string
}

interface ActionData {
  href: string
  icon?: React.ReactNode
  title: string
  description: string
  iconSrc?: string
}

const ActionCard = ({
  href,
  icon,
  title,
  description,
  iconSrc
}: ActionCardProps) => {
  const isComingSoon = title === 'Custom workflow' || title === 'Custom form'
  return (
    <Link
      to={href}
      className="group relative w-full rounded-lg border-2 border-border bg-card p-4 transition-colors duration-200 hover:border-primary hover:border-2 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center border border-border group-hover:border-primary/30 transition-all duration-300">
          {iconSrc ? (
            <img className="w-6 h-6" alt={`${title} icon`} src={iconSrc} />
          ) : (
            <div className="text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {title}
            </h3>
            {isComingSoon && (
              <Badge variant="secondary" className="uppercase">Coming soon</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

      </div>
    </Link>
  )
}

export const CreateActionDialog = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const actions: ActionData[] = [
    {
      href: "/admin/actions/new-action?actionType=calendly",
      iconSrc: CalendlyIcon,
      title: "Get Calendly booking slots",
      description: "Allow customers to book meetings via Calendly"
    },
    {
      href: "#",
      icon: <SolarBoltBoldDuotone color="#8b5cf6" className="w-6 h-6" />,
      title: "Custom workflow",
      description: "Add an action to trigger workflows or external integrations"
    },
    {
      href: "/admin/actions/new-action?actionType=custom-button",
      icon: <SolarBoxMinimalisticBoldDuotone color="#e500b9" className="w-6 h-6" />,
      title: "Custom button",
      description: "Add a custom button action to trigger workflows or external integrations"
    },
    {
      href: "/admin/actions/new-action?actionType=collect_leads",
      icon: <SolarMagniferBoldDuotone color="#ec1313" className="w-6 h-6" />,
      title: "Collect leads",
      description: "Create a lead generation form to capture potential customer information"
    },
    {
      href: "#",
      icon: <SolarClipboardBoldDuotone color="#00ad69" className="w-6 h-6" />,
      title: "Custom form",
      description: "Create a custom form to collect information from customers with validation"
    }
  ]

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-medium">
          Create new action
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl  p-0 gap-0 animate-scale-in">
        <DialogHeader className="px-6 py-4 border-border">
          <DialogTitle className="font-semibold text-xl text-foreground">
            Create a new action
          </DialogTitle>
          <Input
            className="mt-2"
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </DialogHeader>
        <div className="max-h-[60vh] flex-1 overflow-y-auto smooth-div">
          <div className="px-6 pt-2 pb-6">
            <div className="flex flex-col gap-3">
              {filteredActions.length > 0 ? (
                filteredActions.map((action, index) => (
                  <ActionCard
                    key={index}
                    href={action.href}
                    icon={action.icon}
                    iconSrc={action.iconSrc}
                    title={action.title}
                    description={action.description}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No actions found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
