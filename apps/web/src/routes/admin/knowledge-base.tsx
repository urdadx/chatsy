import { DocumentSource } from "@/components/documents-source";
import { QuestionSource } from "@/components/questions-source";
import { TextSource } from "@/components/text-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteSource } from "@/components/website-source";
import { RiQuestionFill } from "@remixicon/react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { FileText, Globe, Paperclip } from "lucide-react";
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
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
      {/* Main content area */}
      <div className="flex-1 lg:basis-[40%] xl:basis-[50%] w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Responsive sidebar - 2x width */}
      <div className="lg:basis-[35%] bg-sidebar w-full">
        <div className="flex flex-col gap-3 items-center border-l justify-center h-full min-h-[200px] lg:min-h-full p-4">
          <div className="w-[340px] border bg-white rounded-lg">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Paperclip className="text-primary/70 w-5 h-5 items-center" />
                  <h2 className="text-sm items-center font-normal">Files</h2>
                </div>
                <h2 className="text-sm font-semibold">0.4 KB</h2>
              </div>
            </div>
          </div>
          <div className="w-[340px] border bg-white rounded-lg">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Globe className="text-primary/70 w-5 h-5 items-center" />
                  <h2 className="text-sm items-center font-normal">Website</h2>
                </div>
                <h2 className="text-sm font-semibold">34 KB</h2>
              </div>
            </div>
          </div>
          <div className="w-[340px] border bg-white rounded-lg">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <RiQuestionFill className="text-primary/70 w-5 h-5 items-center" />
                  <h2 className="text-sm items-center font-normal">Q&A</h2>
                </div>
                <h2 className="text-sm font-semibold">34 KB</h2>
              </div>
            </div>
          </div>
          <div className="w-[340px] border bg-white rounded-lg">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <FileText className="text-primary/70 w-5 h-5 items-center" />
                  <h2 className="text-sm items-center font-normal">Text</h2>
                </div>
                <h2 className="text-sm font-semibold">100 KB</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
