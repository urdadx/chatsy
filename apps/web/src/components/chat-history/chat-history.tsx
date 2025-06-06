import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { ChatConversation } from "./chat-conversation";
import { ChatLogItem } from "./chat-log-item";

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 pt-1 pb-2 border-b bg-white">
      <h1 className="text-md font-semibold ">Chat Logs</h1>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search" className="pl-10  " />
        </div>
        <Button variant="outline" className="text-gray-600">
          <RefreshCw className="h-4 w-4 " />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export const ChatHistory = () => {
  const chatLogs = [
    {
      status: "success",
      title: "Billing Issue",
      description: "I'm sorry to hear you're having this issue, h...",
      timeAgo: "30m ago",
      source: "Website",
    },
    {
      status: "error",
      title: "Billing Issue, Card error",
      description: "Have you tried using a different card? Som...",
      timeAgo: "45m ago",
      badge: "2",
    },
    {
      status: "success",
      title: "Primary card, Payment declined",
      description: "I have two cards on the account though...",
      timeAgo: "45m ago",
    },
    {
      status: "default",
      title: "Payment declined",
      description: "Please check if your card details are corre...",
      timeAgo: "1h ago",
    },
    {
      status: "default",
      title: "Account suspension, Card error",
      description: "Your account is currently suspended. Plea...",
      timeAgo: "1h ago",
      badge: "3",
    },
  ];

  return (
    <div className=" bg-white border rounded-lg my-4 py-2">
      <ChatHeader />
      <div className="flex flex-row h-[calc(100vh-5rem)]">
        <div className="w-96 border-r bg-white ">
          <ScrollArea className="h-full p-1">
            {chatLogs.map((log, index) => (
              <ChatLogItem
                key={index}
                status={log.status}
                title={log.title}
                description={log.description}
                timeAgo={log.timeAgo}
                badge={log.badge}
                source={log.source}
              />
            ))}
          </ScrollArea>
        </div>

        {/* Main conversation area */}
        <div className="w-full flex flex-col h-full relative overflow-hidden">
          <ScrollArea className="flex-1 ">
            <ChatConversation />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
