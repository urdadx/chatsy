import { Skeleton } from "@/components/ui/skeleton"

export const ActionCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-sm mx-auto h-full">
      <div className="flex flex-col gap-2 h-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-11 h-6 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}
