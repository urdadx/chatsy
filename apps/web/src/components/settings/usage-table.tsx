import { Button } from "@/components/ui/button";
import { useUsage } from "@/hooks/use-usage-meters";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

export const UsageTable = () => {
  const { data: meters, isLoading, isError } = useUsage();

  return (
    <div className="mx-auto w-full">
      <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold">Usage</h2>
          </div>
          {isLoading && (
            <div>
              <Skeleton className="h-5 w-full" />
            </div>
          )}
          {isError && (
            <div className="text-sm text-red-500">
              Failed to load usage data.
            </div>
          )}
          {!isLoading &&
            !isError &&
            Array.isArray(meters) &&
            meters.length > 0 &&
            meters.map((meter: any, idx: number) => (
              <div key={meter.meter?.name || idx}>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">
                    {meter.meter?.name === "ai_usage_two"
                      ? "Message credits"
                      : meter.meter?.name}
                  </p>
                  <span className="text-sm font-medium">
                    {meter.consumedUnits ?? 0} / {meter.creditedUnits ?? 0}
                    {meter.meter?.unit ? ` ${meter.meter?.unit}` : ""}
                  </span>
                </div>
                {idx !== meters.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          {!isLoading &&
            !isError &&
            Array.isArray(meters) &&
            meters.length === 0 && (
              <div className="text-sm text-gray-500">
                No usage meters found.
              </div>
            )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button variant="default">Increase limits</Button>
        </div>
      </div>
    </div>
  );
};
