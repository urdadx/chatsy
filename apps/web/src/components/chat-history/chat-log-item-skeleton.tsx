import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface ChatLogItemSkeletonProps {
  className?: string;
}

export const ChatLogItemSkeleton = ({
  className,
}: ChatLogItemSkeletonProps) => {
  return (
    <div
      className={cn(
        "flex items-start w-full space-x-3 p-4 mb-2",
        className
      )}
    >
      {/* Avatar skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Title and Date skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      {/* Badge and Button skeleton */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Skeleton className="h-6 w-16 rounded-xl" />
        <Skeleton className="w-6 h-6 rounded" />
      </div>
    </div>
  );
};
