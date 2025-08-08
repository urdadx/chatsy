import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/use-subscription";
import { addMonths, format, parseISO } from "date-fns";
import { Wallet } from "lucide-react";

export const SubscriptionTable = () => {
  const { data: subscription, isLoading } = useSubscription();

  let nextBilling = "-";
  if (subscription?.currentPeriodEnd) {
    nextBilling = format(new Date(subscription.currentPeriodEnd), "yyyy-MM-dd");
  } else if (subscription?.createdAt) {
    const created =
      typeof subscription.createdAt === "string"
        ? parseISO(subscription.createdAt)
        : new Date(subscription.createdAt);
    nextBilling = format(addMonths(created, 1), "yyyy-MM-dd");
  }

  const planName = subscription?.product?.name || "Unknown Plan";

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-base font-semibold">Subscription</h2>
          </div>
          <div className="flex items-center gap-2 min-h-[24px]">
            {isLoading ? (
              <Skeleton className="h-5 w-3/4" />
            ) : (
              <p className="text-gray-600 text-sm">
                You are currently on the{" "}
                <span className="text-primary font-medium">{planName}</span>.
                Next billing cycle starts on
                <span className="text-primary font-medium"> {nextBilling}</span>
                .
              </p>
            )}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button variant="default" disabled={isLoading}>
            Upgrade
          </Button>{" "}
        </div>
      </div>
    </div>
  );
};
