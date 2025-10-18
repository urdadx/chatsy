import { Skeleton } from "@/components/ui/skeleton"

export function QuickMenuSkeleton() {
  return (
    <div className="flex flex-col gap-2  pb-2">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="shadow-sm bg-white rounded-md w-full p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="w-4 h-4 rounded-full" />
        </div>
      ))}
    </div>
  )
}