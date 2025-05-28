import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export function UpgradeBanner() {
  return (
    <Card className="shadow-none h-fit">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm">⚡ Upgrade to Pro</CardTitle>
        <CardDescription className="py-1">
          Unlock more advanced features with the Pro plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2.5">
        <Link to="/">
          <Button
            className="w-full  text-sidebar-primary-foreground shadow-none"
            size="sm"
          >
            <p className="text-white">Upgrade to Pro</p>{" "}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
