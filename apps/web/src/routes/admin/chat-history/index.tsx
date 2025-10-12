import { SolarRoundedMagniferZoomInBoldDuotone } from "@/assets/icons/search-icon";
import { AssignAgentDialog } from "@/components/chat-history/assign-agent-dialog";
import { ChatConversation } from "@/components/chat-history/chat-conversation";
import { ChatDetailsDialog } from "@/components/chat-history/chat-details-dialog";
import { ChatFilterDialog } from "@/components/chat-history/chat-filter-dialog";
import { ChatLogItem } from "@/components/chat-history/chat-log-item";
import { ChatLogItemSkeleton } from "@/components/chat-history/chat-log-item-skeleton";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Info, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import z from "zod";

export const chatHistorySearchSchema = z.object({
  chatId: z.string().optional(),
  filter: z.enum(["24h", "7d", "30d", "90d", "all"]).default("24h"),
  status: z.enum(["all", "unresolved", "resolved", "escalated"]).default("all"),
});

export const Route = createFileRoute("/admin/chat-history/")({
  component: RouteComponent,
  validateSearch: chatHistorySearchSchema,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/admin/chat-history" });
  const { chatId, filter, status } = useSearch({
    from: "/admin/chat-history/",
  });
  const isMobile = useIsMobile();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedChatTitle, setSelectedChatTitle] = useState<string>("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
  } = useChatHistory(filter, status);

  const chats = data?.pages.flatMap((page) => page.chats) ?? [];

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleChatIdChange = (value: string) => {
    if (isMobile) {
      const selectedChat = chats.find((chat) => chat.id === value);
      setSelectedChatTitle(selectedChat?.title || "Untitled Chat");
      setMobileDrawerOpen(true);
    }

    navigate({
      search: { chatId: value, filter, status },
    });
  };

  const handleApplyFilters = (
    newFilter: "24h" | "7d" | "30d" | "90d" | "all",
    newStatus: "all" | "unresolved" | "resolved" | "escalated"
  ) => {
    navigate({
      search: {
        filter: newFilter,
        status: newStatus,
        chatId: undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen mx-auto p-1 sm:p-4 flex items-center justify-center">
        <Spinner size={28} className="text-primary" />
      </div>
    )
  }

  if (!isLoading && !isError && chats.length === 0) {
    return (
      <div className=" w-full h-[90vh] mx-auto p-1 sm:p-4">
        <div className="bg-white border rounded-xl py-2 h-full flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-1 pb-2 border-b bg-white rounded-t-3xl">
            <h1 className="text-xl font-semibold hidden sm:flex">Chat Logs</h1>
            <div className="flex items-center space-x-3">
              <ChatFilterDialog
                currentFilter={filter}
                currentStatus={status}
                onApplyFilters={handleApplyFilters}
              />
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={() => refetch()}
              >
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center flex-1 min-h-0">
            <div className="flex flex-col items-center space-y-2">
              <SolarRoundedMagniferZoomInBoldDuotone color="#8b5cf6" className="h-14 w-14 text-primary" />
              <p className="text-center text-lg text-gray-500">
                No chat logs found
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" w-full h-[90vh] mx-auto ">

        <div className="bg-white h-full flex flex-col overflow-hidden">

          <div className="flex flex-row flex-1 min-h-0">
            {/* Sidebar */}
            <div className=" flex flex-col gap-2 p-2 py-4">
              <div className="flex items-center mb-2 justify-between">
                <h1 className="text-xl font-semibold hidden sm:flex">Chat Logs</h1>
                <div className="flex items-center space-x-2 ">
                  <Button
                    variant="outline"
                    className="text-gray-600"
                    onClick={() => refetch()}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <ChatFilterDialog
                    currentFilter={filter}
                    currentStatus={status}
                    onApplyFilters={handleApplyFilters}
                  />
                </div>
              </div>
              <div className={`${isMobile ? "w-[96vw]" : "w-96"} bg-white`}>
                <ScrollArea
                  className="h-full "
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const nearBottom =
                      el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

                    if (nearBottom && hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                >
                  {isLoading && chats.length === 0 && <ChatLogItemSkeleton />}

                  {isError && (
                    <div className="flex flex-col justify-center items-center h-full space-y-2">
                      <p className="text-center text-red-500 py-4">
                        Failed to load logs.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {chats?.map((chat) => (
                    <ChatLogItem
                      key={chat.id}
                      id={chat.id}
                      status={chat.status}
                      userId={chat.userId}
                      onClick={() => handleChatIdChange(chat.id)}
                      title={chat.title || "Untitled Chat"}
                      isSelected={chatId === chat.id}
                      description={`${new Date(chat.createdAt).toLocaleDateString()}`}
                    />
                  ))}

                  {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <Spinner className="text-primary" />
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Main conversation area - hidden on mobile */}
            {!isMobile && (
              <div className="flex w-full border-l flex-col relative overflow-hidden">
                <div className="flex border-b justify-end items-center space-x-3 p-2">
                  <AssignAgentDialog />
                  <ChatDetailsDialog chatId={chatId} />
                </div>
                {chatId ? (
                  <ChatConversation />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">
                      Select a chat to view the conversation
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerContent className="h-[85vh]">
            <DrawerHeader className="flex-row items-center justify-between">
              <DrawerTitle className="text-left ">
                {selectedChatTitle}
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden">
              {chatId && <ChatConversation />}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="h-24" />
    </>
  );
}
