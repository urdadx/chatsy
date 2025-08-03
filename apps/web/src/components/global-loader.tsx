import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "./ui/spinner";

export function GlobalLoader() {
  return (
    <div className="w-full p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-[80px] sm:w-[100px]" />
          <Skeleton className="h-6 w-[50px] sm:w-[60px]" />
          <Skeleton className="h-6 w-[60px] sm:w-[80px]" />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Skeleton className="h-6 w-[120px] sm:w-[160px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-16 sm:mt-32 md:mt-48 flex justify-center">
        <h1 className="text-center">
          <Spinner className="text-gray-400" />
        </h1>
      </div>
    </div>
  );
}
