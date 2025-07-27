import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DBMessage, Vote } from "@/db/schema";
import { useChatWithReset } from "@/hooks/use-chat-reset";
import { useChatbot } from "@/hooks/use-chatbot";
import { useMessages } from "@/hooks/use-db-messages";
import { ChatSDKError } from "@/lib/errors";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { ArrowUp, RefreshCcw, SparklesIcon } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { AISuggestion, AISuggestions } from "../ui/ai-suggestions";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "../ui/chat-container";
import { ScrollButton } from "../ui/scroll-button";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { GreetingMessage } from "./greeting-message";
import { PreviewMessage, ThinkingMessage } from "./message";

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    content: "",
    createdAt: message.createdAt,
  }));
}

export function ChatPreview() {
  const { chatId, resetChat } = useChatWithReset();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

  const queryClient = useQueryClient();

  const { messages, setMessages, status, handleSubmit, input, setInput } =
    useChat({
      id: chatId,
      initialMessages,
      fetch: fetchWithErrorHandlers,
      onError: (error) => {
        if (error instanceof ChatSDKError) {
          toast.error(error.message);
        }
      },
      onFinish: () => {
        queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
        queryClient.invalidateQueries({ queryKey: ["messages"] });
      },
    });

  const inputLength = input.trim().length;

  const handleResetChat = useCallback(() => {
    resetChat();
    setMessages([]);
    setInput("");
    toast.success("Chat reset successfully");
    queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  }, [resetChat, setMessages, setInput]);

  const isLastMessageFromUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";
  const isStreamingLastMessage = status === "streaming" && messages.length > 0;

  const { data: chatbot } = useChatbot();

  const SUGGESTIONS = chatbot?.suggestedMessages || [];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const showPoweredBy = !chatbot?.hidePoweredBy;

  const greetingMessage = chatbot?.initialMessage || "";

  const { data: votes }: { data: Array<Vote> | undefined } = useQuery({
    queryKey: ["votes", chatId],
    queryFn: () =>
      fetchWithErrorHandlers(`/api/vote?chatId=${chatId}`).then((res) =>
        res.json(),
      ),
    enabled: messages.length >= 2,
  });

  return (
    <div className="flex-1 flex items-center justify-center">
      <Card className="w-[400px] h-[560px] shadow-lg border-1 py-0">
        {/* Header */}
        <div
          className="p-4 text-white flex items-center justify-between border-b rounded-t-xl bg-primary"
          style={{ backgroundColor: chatbot?.primaryColor }}
        >
          <div className="flex items-center gap-3">
            {chatbot?.image ? (
              <img
                src={chatbot.image}
                alt="Assistant"
                style={{
                  borderColor: chatbot?.primaryColor,
                }}
                className="rounded-full w-10 h-10"
              />
            ) : (
              <SparklesIcon size={17} />
            )}
            <p className="font-normal text-base">
              {chatbot?.name || "Chat Preview"}
            </p>
          </div>
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={handleResetChat}>
                  <RefreshCcw className="h-4 w-4" />
                  <span className="sr-only">Reset chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-primary" side="top">
                Reset chat
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="relative flex-1 h-[350px]">
          <ChatContainerRoot className="h-full">
            <ChatContainerContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner className="text-primary" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  <div>Error loading messages</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <GreetingMessage title={greetingMessage} />
                  )}

                  {/* Render messages */}

                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className="w-full overflow-hidden p-1"
                    >
                      <PreviewMessage
                        chatId={chatId}
                        message={message}
                        isLoading={
                          isStreamingLastMessage &&
                          messages.length - 1 === index
                        }
                        vote={
                          votes
                            ? votes.find(
                                (vote) => vote.messageId === message.id,
                              )
                            : undefined
                        }
                        setMessages={setMessages}
                      />
                    </div>
                  ))}

                  {status === "submitted" && isLastMessageFromUser && (
                    <ThinkingMessage />
                  )}

                  <ChatContainerScrollAnchor />
                </div>
              )}
            </ChatContainerContent>

            <div className="absolute bottom-4 right-4 z-10">
              <ScrollButton className="shadow-lg" />
            </div>
          </ChatContainerRoot>
        </div>

        {/* Footer */}
        <CardFooter className="flex flex-col space-y-2">
          {SUGGESTIONS.length > 0 && (
            <AISuggestions>
              {SUGGESTIONS.map((suggestion) => (
                <AISuggestion
                  onClick={handleSuggestionClick}
                  key={suggestion}
                  suggestion={suggestion}
                />
              ))}
            </AISuggestions>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Chat with me..."
              className="flex-1 text-sm sm:text-base"
              style={
                {
                  "--tw-ring-color": chatbot?.primaryColor,
                } as React.CSSProperties
              }
              autoComplete="off"
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              className="rounded-full"
              style={{ backgroundColor: chatbot?.primaryColor }}
              type="submit"
              size="icon"
              disabled={inputLength === 0}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>

          {showPoweredBy ? (
            <div className="flex pt-1 pb-3 items-center justify-center text-xs text-muted-foreground">
              <span>Powered by </span>
              <a
                href="https://padyna.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: chatbot?.primaryColor }}
                className="ml-1 hover:underline font-semibold"
              >
                Padyna
              </a>
            </div>
          ) : (
            <div className="h-4" />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
