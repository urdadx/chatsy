import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsage } from "@/hooks/use-usage-meters";
import { getDaysUntilReset } from "@/lib/utils";
import { motion } from "motion/react";
import { AddOnsDialog } from "./add-ons-dialog";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";

export function UsageBanner() {
  const { data, isLoading, isError } = useUsage("ai_usage_two");
  const meter = Array.isArray(data) ? data[0] : data;

  const creditedUnits = meter?.creditedUnits ?? 0;
  const balance = meter?.balance ?? 0;
  const totalUsage = creditedUnits;
  const currentUsage = creditedUnits - balance;
  const usagePercentage =
    creditedUnits > 0 ? (balance / creditedUnits) * 100 : 0;

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
              Resets in {getDaysUntilReset(meter?.createdAt)}
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
