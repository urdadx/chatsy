import { DocumentSource } from "@/components/knowledge-base/document-source/documents-source";
import { QuestionSource } from "@/components/knowledge-base/question-source/questions-source";
import { TextSource } from "@/components/knowledge-base/text-source/text-source";
import { TrainAgent } from "@/components/knowledge-base/train-agent";
import { WebsiteSource } from "@/components/knowledge-base/website-source/website-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import z from "zod";

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
    navigate({ search: { tab: value as "qa" | "files" | "website" | "text" } });
  };

  return (
    <div className="">
      {/* Main content scrollable */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:pr-[360px] bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold mb-6">Knowledge Base</h1>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0">
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

            <TabsContent value="files" className="mt-6">
              <DocumentSource />
            </TabsContent>
            <TabsContent value="qa" className="mt-6">
              <QuestionSource />
            </TabsContent>
            <TabsContent value="website" className="mt-6">
              <WebsiteSource />
            </TabsContent>
            <TabsContent value="text" className="mt-6">
              <TextSource />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sidebar (fixed on right for lg screens and up) */}
      <div className="hidden lg:flex fixed top-0 right-0 h-screen w-[340px] border-l bg-gray-50 p-4 items-center justify-center">
        <TrainAgent />
      </div>
    </div>
  );
}
