import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";

export function UsageBanner() {
  const currentUsage = 70;
  const totalUsage = 100;
  const usagePercentage = (currentUsage / totalUsage) * 100;

  return (
    <Card className="shadow-none h-fit">
      <div className="px-4 grid gap-4">
        <p className=" text-sm text-gray-800">
          {" "}
          Usage: {currentUsage}/{totalUsage}
        </p>
        <div className="mb-2">
          <div className="flex justify-between text-xs">
            <span className="mb-2">Resets in 22 days</span>
          </div>
          <Progress value={usagePercentage} />
        </div>
        <Link to="/">
          <Button
            className="w-full  text-sidebar-primary-foreground shadow-none"
            size="sm"
          >
            <p className="text-white">Buy more credits</p>{" "}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
