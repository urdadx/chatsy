import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChatHistory } from "@/hooks/use-chat-history";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";

import { ChatConversation } from "@/components/chat-history/chat-conversation";
import { ChatLogItem } from "@/components/chat-history/chat-log-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiSearch2Line } from "@remixicon/react";
import { z } from "zod";

export const chatHistorySearchSchema = z.object({
  chatId: z.string().optional(),
  filter: z.enum(["24h", "7d", "30d", "90d", "all"]).default("24h"),
});

export const Route = createFileRoute("/admin/chat-history/")({
  component: RouteComponent,
  validateSearch: chatHistorySearchSchema,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/admin/chat-history" });
  const { chatId, filter } = useSearch({ from: "/admin/chat-history/" });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
  } = useChatHistory(filter);

  const chats = data?.pages.flatMap((page) => page.chats) ?? [];

  const handleChatIdChange = (value: string) => {
    navigate({
      search: { chatId: value, filter },
    });
  };

  const handleFilterChange = (value: string) => {
    navigate({
      search: {
        filter: value as "24h" | "7d" | "30d" | "90d" | "all",
        chatId: undefined,
      },
    });
  };

  if (!isLoading && !isError && chats.length === 0) {
    return (
      <div className="max-w-5xl my-4 w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
        <div className="bg-white border rounded-lg my-4 py-2">
          <div className="flex items-center justify-between px-4 pt-1 pb-2 border-b bg-white">
            <h1 className="text-md font-semibold">Chat Logs</h1>
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
                  <SelectItem value="all">All time</SelectItem>
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
          <div className="flex justify-center items-center h-[calc(100vh-13rem)]">
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
      <div className="max-w-5xl w-full max-h-screen mx-auto px-2 sm:px-0 py-4">
        <span className="text-md text-muted-foreground">
          View and manage your bot's chat history
        </span>
        <div className="bg-white border rounded-lg my-4 py-2">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 pt-1 pb-2 border-b bg-white">
            <h1 className="text-md font-semibold">Chat Logs</h1>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Select value={filter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last month</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="text-gray-600"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex flex-row h-[calc(100vh-13rem)]">
            {/* Sidebar */}
            <div className="w-96 border-r bg-white">
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
                {isLoading && chats.length === 0 && (
                  <div className="flex justify-center items-center h-full">
                    <Spinner className="text-primary" />
                  </div>
                )}

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
                    type={chat.visibility}
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

            {/* Main conversation area */}
            <div className="w-full flex flex-col h-full relative overflow-hidden">
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
          </div>
        </div>
        <div className="h-[14px]" />
      </div>
    </>
  );
}
