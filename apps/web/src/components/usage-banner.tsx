import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsage } from "@/hooks/use-usage-meters";
import { authClient } from "@/lib/auth-client";

export function getDaysUntilReset(createdAt?: Date) {
  if (!createdAt) return "-";
  const created = new Date(createdAt);
  const reset = new Date(created);
  reset.setMonth(reset.getMonth() + 1);
  const now = new Date();
  const diffTime = reset.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

export function UsageBanner() {
  const { data, isLoading, isError } = useUsage();

  const creditedUnits = data?.creditedUnits ?? 0;
  const balance = data?.balance ?? 0;
  const totalUsage = creditedUnits;
  const currentUsage = creditedUnits - balance;
  const usagePercentage =
    creditedUnits > 0 ? (balance / creditedUnits) * 100 : 0;

  const handleCheckout = async () => {
    const organizationId = (await authClient.organization.list())?.data?.[0]
      ?.id;
    await authClient.checkout({
      slug: "starter",
      referenceId: organizationId,
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-none h-fit">
        <div className="px-4 grid gap-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-full mb-4" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-none h-fit">
        <div className="px-4 grid gap-4 text-red-500">
          Failed to load usage.
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-none h-fit">
      <div className="px-4 grid gap-4">
        <h3 className="text-sm font-medium text-gray-600">
          Usage: {currentUsage} / {totalUsage}
        </h3>
        <div className="mb-2">
          <div className="flex justify-between text-xs">
            <span className="mb-2">
              Resets in {getDaysUntilReset(data?.createdAt)}
            </span>
          </div>
          <Progress value={usagePercentage} />
        </div>
        <Button
          onClick={handleCheckout}
          className="w-full text-sidebar-primary-foreground shadow-none"
          size="sm"
        >
          <p className="text-white">Buy more credits</p>
        </Button>
      </div>
    </Card>
  );
}
