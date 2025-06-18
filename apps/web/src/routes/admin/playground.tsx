import { DigitalProducts } from "@/components/digital-products";
import { BotQuestions } from "@/components/playground/questions";
import { SocialLinks } from "@/components/playground/social-links";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/playground")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-3xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
      <span className="text-md text-muted-foreground">
        Train your bot based on your social links, fan questions, and digital
        products
      </span>

      <Tabs defaultValue="tab-1" className=" mt-6 ">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="tab-1"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Links
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Q&A
          </TabsTrigger>

          <TabsTrigger
            value="tab-3"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tab-1">
          <SocialLinks />
        </TabsContent>
        <TabsContent value="tab-2">
          <BotQuestions />
        </TabsContent>
        <TabsContent value="tab-3">
          <DigitalProducts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
