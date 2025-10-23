import { SolarStarIcon } from "@/assets/icons/star-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Link } from "@tanstack/react-router";

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

  const getDescription = () => {
    if (isTrialing && trialDaysLeft > 0) {
      return "Upgrade now to continue enjoying all features.";
    }
    if (!hasSubscription) {
      return "Unlock advanced features with the Pro plan.";
    }
    return "Unlock advanced features with the Pro plan.";
  };

  const getButtonText = () => {
    if (isTrialing || !hasSubscription) {
      return "Choose a Plan";
    }
    return "Upgrade to Pro";
  };

  return (
    <Card className="shadow-none h-fit gap-2">
      <CardHeader className="">
        <CardTitle className="text-sm flex gap-1 font-normal">
          <SolarStarIcon size="20" color="#8b5cf6" />
          {getTitle()}</CardTitle>
        <CardDescription className="text-sm py-1">{getDescription()}</CardDescription>
      </CardHeader>
      <div className="grid px-3">
        <Link to="/choose-plan">
          <Button
            className="w-full text-sidebar-primary-foreground shadow-none"
            size="sm"
          >
            <TextShimmer duration={1.5} className="text-white">
              {getButtonText()}
            </TextShimmer>
          </Button>
        </Link>
      </div>
    </Card>
  );
}
