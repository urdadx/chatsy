import { SolarStarIcon } from "@/assets/icons/star-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { authClient } from "@/lib/auth-client";

export function UpgradeBanner({ subscription }: { subscription?: any }) {

  const trialDaysLeft = subscription?.trialEnd
    ? Math.ceil(
      (new Date(subscription.trialEnd).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    )
    : 0;

  const isTrialing = subscription?.status === "trialing";
  const hasSubscription = !!subscription;

  // Determine the appropriate messaging
  const getTitle = () => {
    if (isTrialing && trialDaysLeft > 0) {
      return `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left in your trial`;
    }
    if (isTrialing && trialDaysLeft <= 0) {
      return "Your trial has ended";
    }
    if (!hasSubscription) {
      return "Start Your Free Trial";
    }
    return "Upgrade Available";
  };

  const handleCustomerPortal = async () => {
    await authClient.customer.portal();
  }



  return (
    <Card className="shadow-none h-fit gap-2">
      <CardHeader className="">
        <CardTitle className="text-sm flex gap-1 font-normal">
          <SolarStarIcon size="20" color="#8b5cf6" />
          {getTitle()}</CardTitle>
        <CardDescription className="text-sm py-1">
          Upgrade now to continue enjoying all features.
        </CardDescription>
      </CardHeader>
      <div className="grid px-3">
        <Button
          onClick={handleCustomerPortal}
          className="w-full text-sidebar-primary-foreground shadow-none"
          size="sm"
        >
          <TextShimmer duration={1.5} className="text-white">
            Upgrade your plan
          </TextShimmer>
        </Button>
      </div>
    </Card>
  );
}
