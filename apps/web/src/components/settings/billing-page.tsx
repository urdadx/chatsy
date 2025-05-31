import { Button } from "@/components/ui/button";
import { Globe, Sparkles, Wallet } from "lucide-react";

export function Billing() {
  return (
    <div className="w-full mx-auto pt-3 space-y-6">
      <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Wallet className="w-5 h-5 text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">
          You are currently on the{" "}
          <span className="text-primary">Free Plan</span>
        </span>
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
        <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
        <p className="text-sm">Upgrade your plan to access more features</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="default">
          <Sparkles className="mr-1 h-4 w-4" /> Upgrade Plan
        </Button>
      </div>
    </div>
  );
}
