import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
  return (
    <div className="w-full max-w-3xl bg-card rounded-lg border border-border shadow-xs">
      {/* Header Section */}
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
            <Skeleton className="h-3 sm:h-4 w-full max-w-xs sm:max-w-md" />
          </div>
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-10 sm:w-12" />
          <Skeleton className="h-9 sm:h-10 w-full" />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-44 sm:w-56" />
          <Skeleton className="h-20 sm:h-24 w-full" />
        </div>

        {/* Button Text Field */}
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
          <Skeleton className="h-9 sm:h-10 w-full" />
        </div>

        {/* Destination URL Field */}
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
          <Skeleton className="h-9 sm:h-10 w-full" />
        </div>

        {/* Switch Field */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-5 w-9 sm:h-6 sm:w-11 rounded-full" />
          <Skeleton className="h-3 sm:h-4 w-56 sm:w-72" />
        </div>
      </div>

      {/* Footer Section */}
      <div className="border-t rounded-b-lg bg-gray-50 border-border p-4 sm:p-6 flex items-center justify-end gap-2 sm:gap-3">
        <Skeleton className="h-9 sm:h-10 w-24 sm:w-32" />
      </div>
    </div>
  )
}
