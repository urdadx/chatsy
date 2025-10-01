import { Button } from "@/components/ui/button"
import NumberFlow from "@number-flow/react"
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react"

interface DashboardCardProps {
  icon: any;
  title?: string;
  value: number;
  href?: string;
  gradientFrom?: string;
  gradientVia?: string;
}

export function DashboardCard({
  icon: Icon,
  title,
  value,
  href,

}: DashboardCardProps) {
  return (
    <div className={"group relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-bl from-slate-50 via-slate-25 to-background p-2.5 shadow-xs  dark:shadow-none dark:from-orange-950/20 dark:via-orange-900/10"}>
      {/* Icon Container with Layered Design */}
      <div className="flex flex-row items-center gap-3">
        <div className="relative size-[60px] shrink-0 scale-90 rounded-[20px] shadow-[3px_5px_15px_-2px_rgb(0_0_0/0.075),2px_3px_6px_-4px_rgb(0_0_0/0.075)] dark:shadow-[3px_5px_15px_-2px_rgb(255_255_255/0.075),2px_3px_6px_-4px_rgb(255_255_255/0.075)]">
          {/* Base layer */}
          <div className="absolute inset-0 rounded-[20px] bg-white dark:bg-black"></div>
          {/* Middle gradient layer */}
          <div className="absolute inset-[3px] rounded-[18px] bg-gradient-to-br from-gray-200 via-white to-white dark:from-gray-700 dark:via-black dark:to-black"></div>
          {/* Top gradient layer */}
          <div className="absolute inset-[4px] rounded-[17px] bg-gradient-to-tl from-gray-100 via-white to-white dark:from-gray-800 dark:via-black dark:to-black"></div>
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-foreground">
            <Icon className="size-5" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex grow flex-col justify-center gap-[3px]">
          {/* Header with Title and Action Buttons */}
          {title && (
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          )}

          {/* Metrics Display */}
          <div className="flex items-baseline">
            <NumberFlow
              className="whitespace-nowrap font-extrabold text-2xl leading-none tracking-tight"
              value={value}
            />
          </div>
        </div>
      </div>

      {/* More Link Button */}
      {href && (
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-2.5 right-2.5 h-6 gap-1 rounded-sm text-xs text-muted-foreground bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          asChild
        >
          <Link to={href}>
            View
            <ChevronRight className="size-3" />
          </Link>
        </Button>
      )}
    </div>
  )
}
