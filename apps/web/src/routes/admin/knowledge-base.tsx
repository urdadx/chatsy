import { DocumentSource } from "@/components/documents-source";
import { QuestionSource } from "@/components/questions-source";
import { TextSource } from "@/components/text-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteSource } from "@/components/website-source";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { z } from "zod";

const knowledgeSchema = z.object({
  tab: z.enum(["qa", "website", "files", "text"]).optional().default("files"),
});

export const Route = createFileRoute("/admin/knowledge-base")({
  component: RouteComponent,
  validateSearch: knowledgeSchema,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/admin/knowledge-base" });
  const { tab } = useSearch({ from: "/admin/knowledge-base" });

  const handleTabChange = (value: string) => {
    navigate({
      search: {
        tab: value as "qa" | "files" | "website" | "text",
      },
    });
  };

  return (
    <div className="max-w-4xl w-full max-h-screen mx-auto px-2 sm:px-0 py-2">
      <h1 className="text-xl font-semibold my-4">Knowledge Base</h1>

      <Tabs value={tab} onValueChange={handleTabChange} className="">
        <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 ">
          <TabsTrigger
            value="files"
            className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Files
          </TabsTrigger>
          <TabsTrigger
            value="qa"
            className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Q&A
          </TabsTrigger>
          <TabsTrigger
            value="website"
            className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Website
          </TabsTrigger>

          <TabsTrigger
            value="text"
            className="hover:bg-accent text-sm hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <div className="mt-6  ">
            <DocumentSource />
          </div>
          <div className="h-10" />
        </TabsContent>

        <TabsContent value="qa">
          <div className="mt-6  ">
            <QuestionSource />
          </div>
          <div className="h-10" />
        </TabsContent>

        <TabsContent value="website">
          <div className="mt-6 ">
            <WebsiteSource />
          </div>
          <div className="h-10" />
        </TabsContent>
        <TabsContent value="text">
          <div className="mt-6 ">
            <TextSource />
          </div>
          <div className="h-10" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
