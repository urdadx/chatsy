import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ToolSkeletonProps {
  className?: string;
}

/**
 * Skeleton for calendar/appointment booking tools (Cal.com, Calendly)
 */
export function BookingToolSkeleton({ className }: ToolSkeletonProps) {
  return (
    <Skeleton className={cn("h-24 w-full rounded-lg", className)} />
  );
}

/**
 * Skeleton for custom button tool
 */
export function CustomButtonSkeleton({ className }: ToolSkeletonProps) {
  return (
    <Skeleton className={cn("h-10 w-full rounded-lg", className)} />
  );
}

/**
 * Skeleton for escalate to human notification
 */
export function EscalateToHumanSkeleton({ className }: ToolSkeletonProps) {
  return (
    <Skeleton className={cn("h-16 w-full rounded-lg", className)} />
  );
}

/**
 * Skeleton for collect leads form
 */
export function CollectLeadsFormSkeleton({ className }: ToolSkeletonProps) {
  return (
    <Skeleton className={cn("h-48 w-full rounded-lg", className)} />
  );
}

/**
 * Skeleton for collect feedback form
 */
export function CollectFeedbackFormSkeleton({ className }: ToolSkeletonProps) {
  return (
    <Skeleton className={cn("h-32 w-full rounded-lg", className)} />
  );
}

/**
 * Generic tool skeleton for unknown tool types
 */
export function GenericToolSkeleton({ className }: ToolSkeletonProps) {
  return (
    <Skeleton className={cn("h-20 w-full rounded-lg", className)} />
  );
}
