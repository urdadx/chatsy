import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { getActiveSubscription } from "@/lib/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { addMonths, format, parseISO } from "date-fns";
import { Wallet } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const SubscriptionTable = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["activeSubscription"],
    queryFn: () => getActiveSubscription(),
  });

  let nextBilling = "-- -- ----";
  if (subscription?.currentPeriodEnd) {
    nextBilling = format(new Date(subscription.currentPeriodEnd), "yyyy-MM-dd");
  } else if (subscription?.createdAt) {
    const created =
      typeof subscription.createdAt === "string"
        ? parseISO(subscription.createdAt)
        : new Date(subscription.createdAt);
    nextBilling = format(addMonths(created, 1), "yyyy-MM-dd");
  }

  const planName = subscription?.product?.name || "No active plan";

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-base font-semibold">Recent Subscription</h2>
          </div>
          <div className="flex items-center gap-2 min-h-[24px]">
            {isLoading ? (
              <Skeleton className="h-5 w-3/4" />
            ) : !subscription ? (
              <p className="text-gray-600 text-sm">You have no active plan.</p>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/choose-plan">
                  <Button variant="default" disabled={isLoading || !isAdmin}>
                    Upgrade
                  </Button>
                </Link>
              </motion.div>
            </TooltipTrigger>
            {!isAdmin && (
              <TooltipContent className="bg-white shadow-sm p-3" sideOffset={8}>
                <p className="text-black text-sm">
                  Only admins can change workspace logo. Please contact your
                  admin
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
