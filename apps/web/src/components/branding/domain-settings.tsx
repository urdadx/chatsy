import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Link as LinkIcon, Sparkles } from "lucide-react";
import { useState } from "react";

export function DomainSettings() {
  const [domain, _setDomain] = useState("urdadx.chatsy.me");

  return (
    <div className="w-full mx-auto px-2 sm:px-0">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="space-y-1 mt-6 mb-3">
            <p className="text-muted-foreground text-sm">
              Create a custom domain for your workspace.
            </p>
          </div>
          <div className="*:not-first:mt-2">
            <div className="relative items-center flex">
              <Input
                className="peer ps-9"
                placeholder="Enter your custom domain"
                value={domain}
                type="text"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <LinkIcon size={16} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
          <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm">Upgrade your plan to add a custom domain.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default">
            <Sparkles className="mr-1 h-4 w-4" /> Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
