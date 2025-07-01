import { useMessages } from "@/hooks/use-db-messages";
import { useSearch } from "@tanstack/react-router";
import { convertToUIMessages } from "../chat-preview";
import { PreviewMessage } from "../message";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Spinner } from "../ui/spinner";

export const ChatConversation = () => {
  const { chatId } = useSearch({ from: "/admin/chat-history/" });
  const {
    data: messagesFromDb,
    isLoading,
    error,
    refetch,
  } = useMessages(chatId || "");

  const messages = messagesFromDb ? convertToUIMessages(messagesFromDb) : [];

  return (
    <ScrollArea className="flex-1 h-[320px]">
      <div className=" p-4 ">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner className="text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center space-y-2">
                <div>Error loading messages</div>
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages?.map((message) => (
                <div key={message.id} className="w-full overflow-hidden p-1">
                  <PreviewMessage
                    chatId={chatId || ""}
                    message={message}
                    setMessages={messages}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
