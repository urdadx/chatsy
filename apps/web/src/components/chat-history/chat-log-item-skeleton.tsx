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
        "flex items-start w-full sm:w-[350px] space-x-3 p-4 border-b border-gray-100",
        className,
      )}
    >
      {/* Avatar skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title skeleton */}
        <Skeleton className="h-4 w-3/4" />

        {/* Description skeleton */}
        <Skeleton className="h-3 w-1/2" />
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center space-x-3">
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-10 rounded-full" />

        {/* Button skeleton */}
        <Skeleton className="w-6 h-6 rounded" />
      </div>
    </div>
  );
};
