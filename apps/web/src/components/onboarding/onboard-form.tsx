import OnboardFirstPhoto from "@/assets/svgs/thinking-girl.svg";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import OnboardStepper from "../onboard-stepper";

export function OnboardForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-0", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px]">
          <div className="p-6 md:p-8 border-r">
            <div className="flex flex-col gap-6">
              <OnboardStepper />
            </div>
          </div>
          <div className="relative hidden  md:block">
            <img
              src={OnboardFirstPhoto}
              alt="side"
              className="absolute inset-0 h-full w-full object-contain "
            />
          </div>{" "}
        </CardContent>
      </Card>
    </div>
  );
}
