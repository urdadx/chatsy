import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Link } from "@tanstack/react-router";

export function UpgradeBanner() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm">⚡ Upgrade to Pro</CardTitle>
        <CardDescription className="">
          Unlock more advanced features with the Pro plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2.5 px-3">
        <Link to="/choose-plan">
          <Button
            className="w-full text-sidebar-primary-foreground shadow-none"
            size="sm"
          >
            <TextShimmer duration={1.5} className="text-white">
              Upgrade to Pro
            </TextShimmer>{" "}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
