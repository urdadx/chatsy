import { BrandingSettings } from "@/components/branding/branding-settings";
import { DomainSettings } from "@/components/branding/domain-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { z } from "zod";

const brandingSearchSchema = z.object({
  tab: z.enum(["general", "domains"]).optional().default("general"),
});

export const Route = createFileRoute("/admin/branding")({
  component: RouteComponent,
  validateSearch: brandingSearchSchema,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/admin/branding" });
  const { tab } = useSearch({ from: "/admin/branding" });

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as "general" | "domains" },
    });
  };
  return (
    <div className="max-w-3xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <span className="text-md text-muted-foreground">
        Customize your bot's appearance and manage your domains.
      </span>
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full mt-6">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="general"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="domains"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Domains
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <BrandingSettings />
        </TabsContent>
        <TabsContent value="domains">
          <DomainSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
