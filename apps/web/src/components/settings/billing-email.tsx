import { Input } from "@/components/ui/input";
import { getActiveSubscription } from "@/lib/auth-utils";
import { useQuery } from "@tanstack/react-query";

export const BillingEmail = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["activeSubscription"],
    queryFn: () => getActiveSubscription(),
  });

  const billingEmail = isLoading ? "loading..." : subscription?.customer?.email;

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-3xl shadow-xs border overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-base font-semibold mb-2">Billing email</h2>
          <p className="text-gray-600 text-sm">
            Email address where you receive billing notifications.
          </p>
        </div>
        <div className="p-6 pt-3">
          <div className="flex flex-col gap-4">
            <Input
              id="workspace-name"
              type="text"
              className="mt-1 block w-full bg-gray-200 text-black"
              disabled
              value={billingEmail}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
