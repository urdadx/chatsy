import { AccountSettings } from "@/components/settings/account-settings";
import { Billing } from "@/components/settings/billing-page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-3xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <span className="text-md text-muted-foreground">
        Manage your workspace settings, update your profile and billing
        information.
      </span>
      <Tabs defaultValue="tab-1" className="w-full mt-6">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="tab-1"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Account
          </TabsTrigger>

          <TabsTrigger
            value="tab-3"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="tab-4"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Feedback
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="tab-3">
          <Billing />
        </TabsContent>
        <TabsContent value="tab-4">
          <p className="text-muted-foreground py-4 text-sm">
            Help us improve <span className="text-primary">Chatsy</span> by
            sharing your feedback.
          </p>
          <a
            href="https://urdadx.userjot.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>
              <Mail className="h-4 w-4" />
              Submit Feedback
            </Button>
          </a>
        </TabsContent>
      </Tabs>
    </div>
  );
}
