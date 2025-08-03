import { BillingEmail } from "./billing-email";
import { SubscriptionTable } from "./subscription-table";
import { UsageTable } from "./usage-table";

export function Billing() {
  return (
    <>
      <div className="w-full mx-auto pt-3 space-y-6">
        <SubscriptionTable />
        <UsageTable />
        <BillingEmail />
      </div>
      <div className="h-14" />
    </>
  );
}
