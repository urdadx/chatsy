import { useMessages } from "@/hooks/use-db-messages";
import { useSearch } from "@tanstack/react-router";
import { convertToUIMessages } from "../chat/convert-to-ui-message";
import { PreviewMessage } from "../chat/message";
import { Button } from "../ui/button";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "../ui/chat-container";
import { ScrollButton } from "../ui/scroll-button";
import Spinner from "../ui/spinner";

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
    <div className="relative flex-1 h-full">
      <ChatContainerRoot className="h-full smooth-div">
        <ChatContainerContent className="p-4">
          <div className="w-full space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
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
                      isLoading={false}
                      vote={undefined}
                    />
                  </div>
                ))}

                <ChatContainerScrollAnchor />
              </div>
            )}
          </div>
        </ChatContainerContent>

        {/* Floating scroll button - positioned within ChatContainerRoot */}
        <div className="absolute bottom-4 right-4 z-10">
          <ScrollButton className="shadow-lg" />
        </div>
      </ChatContainerRoot>
    </div>
  );
};
