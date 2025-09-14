import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useChatHistory } from "@/hooks/use-chat-history";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { ChatConversation } from "@/components/chat-history/chat-conversation";
import { ChatLogItem } from "@/components/chat-history/chat-log-item";
import { ChatLogItemSkeleton } from "@/components/chat-history/chat-log-item-skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { RiSearch2Line } from "@remixicon/react";
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

  const handleFilterChange = (value: string) => {
    navigate({
      search: {
        filter: value as "24h" | "7d" | "30d" | "90d",
        chatId: undefined,
        status,
      },
    });
  };

  const handleStatusChange = (value: string) => {
    navigate({
      search: {
        status: value as "all" | "unresolved" | "resolved" | "escalated",
        filter,
        chatId: undefined,
      },
    });
  };

  if (!isLoading && !isError && chats.length === 0) {
    return (
      <div className="max-w-5xl lg:max-w-6xl w-full overflow-hidden h-screen mx-auto p-1 sm:p-4">
        <div className="bg-white border rounded-lg py-2 h-full flex flex-col">
          <div className="flex items-center justify-between px-4 pt-1 pb-2 border-b bg-white">
            <h1 className="text-md font-semibold hidden sm:flex">Chat Logs</h1>
            <div className="flex items-center space-x-3">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last month</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center flex-1 min-h-0">
            <div className="flex flex-col items-center space-y-2">
              <RiSearch2Line className="h-14 w-14 text-primary" />
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
      <div className="max-w-5xl lg:max-w-6xl w-full overflow-hidden h-screen mx-auto p-1 sm:p-4">
        <div className="bg-white border rounded-lg py-2 h-full flex flex-col">
          {/* Chat Header */}
          <div className="w-full flex items-center gap-2 justify-between px-4 pt-1 pb-2 border-b bg-white">
            <div className="flex items-center space-x-3 relative">
              <h1 className="text-md font-semibold">Chat History</h1>
            </div>{" "}
            <div className="flex items-center space-x-3">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Select value={filter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last month</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <Button
                variant="outline"
                className="text-gray-600 hidden sm:flex"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button> */}
            </div>
          </div>
          <div className="flex flex-row flex-1 min-h-0">
            {/* Sidebar */}
            <div className={`${isMobile ? "w-full" : "w-96"} bg-white`}>
              <ScrollArea
                className="h-full p-1"
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

            {/* Main conversation area - hidden on mobile */}
            {!isMobile && (
              <div className="flex w-full border-l flex-col h-full relative overflow-hidden">
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
    </>
  );
}
