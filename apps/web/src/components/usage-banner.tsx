import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveMeters } from "@/hooks/use-usage-meters";
import { motion } from "motion/react";
import { AddOnsDialog } from "./add-ons-dialog";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { UpgradeBanner } from "./upgrade-banner";

export function UsageBanner() {
  const { data, isLoading, isError, refetch } = useActiveMeters();
  const activeMeters = data?.activeMeters[0] || null
  const subscription = data?.activeSubscriptions?.[0] || null

  // @ts-ignore - polar needs to update their types for better auth
  const isTrialing = subscription?.status === "trialing"

  const creditedUnits = activeMeters?.creditedUnits ?? 0;
  const balance = activeMeters?.balance ?? 0;
  const totalUsage = creditedUnits;
  const currentUsage = creditedUnits - balance;
  const usagePercentage =
    creditedUnits > 0 ? (balance / creditedUnits) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="shadow-none h-fit">
        <div className="px-4 grid gap-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  if (isTrialing) {
    return <UpgradeBanner subscription={subscription} />;
  }


  if (isError) {
    return (
      <Card className="shadow-none h-fit px-2">
        <div className="px-4 grid gap-4">
          <h3 className="text-sm font-medium text-red-600">
            Error loading usage data
          </h3>
        </div>
        <Button variant="outline" className="mt-2 h-9" onClick={() => refetch()}>
          Try Again
        </Button>
      </Card>
    )


  }

  return (
    <Card className="shadow-none h-fit">
      <div className="px-4 grid gap-4">
        {activeMeters ? (
          ""
        ) : (
          <h3 className="text-sm font-medium text-gray-600">
            No subscription found
          </h3>
        )}
        <div className="">
          <div className="flex justify-between text-xs mb-2">
            <span className="">
              Credits used
            </span>
            <span>
              {currentUsage} of {totalUsage}{" "}
            </span>
          </div>
          <Progress value={usagePercentage} />
        </div>
        <Dialog>
          <DialogTrigger className="w-full mx-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full text-sidebar-primary-foreground shadow-none"
                size="sm"
              >
                <p className="text-white">Buy more credits</p>
              </Button>

            </motion.div>
          </DialogTrigger>
          <AddOnsDialog defaultValue="messages" />
        </Dialog>
      </div>
    </Card>
  );
}
