import { DigitalProducts } from "@/components/digital-products";
import { BotQuestions } from "@/components/playground/questions";
import { SocialLinks } from "@/components/playground/social-links";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { z } from "zod";

const playgroundSearchSchema = z.object({
  tab: z.enum(["socials", "qa", "products"]).optional().default("socials"),
});

export const Route = createFileRoute("/admin/playground")({
  component: RouteComponent,
  validateSearch: playgroundSearchSchema,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/admin/playground" });
  const { tab } = useSearch({ from: "/admin/playground" });

  const handleTabChange = (value: string) => {
    navigate({
      search: { tab: value as "socials" | "qa" | "products" },
    });
  };

  return (
    <div className="max-w-3xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <span className="text-md text-muted-foreground">
        Train your bot based on your social links, fan questions, and your
        products
      </span>

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="socials"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Links
          </TabsTrigger>
          <TabsTrigger
            value="qa"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Q&A
          </TabsTrigger>

          <TabsTrigger
            value="products"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="socials">
          <SocialLinks />
        </TabsContent>
        <TabsContent value="qa">
          <BotQuestions />
        </TabsContent>
        <TabsContent value="products">
          <DigitalProducts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
