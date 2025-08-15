import { ChatPreview } from "@/components/chat/chat-preview";
import { ChatbotSettings } from "@/components/chatbot-settings/chatbot-settings";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { createFileRoute } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/playground")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Main content */}
      <div className="h-full overflow-y-auto hide-scrollbar md:pr-[420px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          <div className="mb-6 hidden sm:flex">
            <h1 className="text-xl font-semibold mb-2 ">Playground</h1>
            <p className="text-muted-foreground hidden sm:block">
              Preview and configure your chatbot's behavior and styling
            </p>
          </div>

          <ChatbotSettings />
        </div>
      </div>

      {/* Fixed Sidebar - Hidden on mobile */}
      <aside className="hidden sm:flex fixed top-7 right-0 w-[420px] h-full border-l px-4 py-6 z-0">
        <div className="h-full flex items-center justify-center">
          <ChatPreview />
        </div>
      </aside>

      {/* Mobile Preview Button */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button className="flex sm:hidden rounded-full shadow-lg fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Eye className="w-5 h-5" />
            Preview
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[95%] px-2">
          <DrawerHeader>
            <DrawerTitle className="sr-only">Chat Preview</DrawerTitle>
          </DrawerHeader>
          <ChatPreview />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
