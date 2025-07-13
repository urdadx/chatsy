import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DBMessage } from "@/db/schema";
import { useBranding } from "@/hooks/use-bot-branding";
import { useChatWithReset } from "@/hooks/use-chat-reset";
import { useMessages } from "@/hooks/use-db-messages";
import { ChatSDKError } from "@/lib/errors";
import { fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { ArrowUp, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { GreetingMessage } from "./greeting-message";
import { PreviewMessage, ThinkingMessage } from "./message";
import { AISuggestion, AISuggestions } from "./ui/ai-suggestions";
import { ScrollArea } from "./ui/scroll-area";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

  const {
    messages,
    setMessages,
    status,
    reload,
    handleSubmit,
    input,
    setInput,
  } = useChat({
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
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputLength = input.trim().length;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleResetChat = useCallback(() => {
    resetChat();
    setMessages([]);
    setInput("");
    toast.success("Chat reset successfully");
    queryClient.invalidateQueries({ queryKey: ["chat-logs"] });
    queryClient.invalidateQueries({ queryKey: ["messages"] });
  }, [resetChat, setMessages, setInput]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const isLastMessageFromUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";
  const isStreamingLastMessage = status === "streaming" && messages.length > 0;

  // get bot's branding data
  const { data: branding } = useBranding();
  console.log("Branding data:", branding);

  const SUGGESTIONS = branding?.suggestedMessages || [];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const showPoweredBy = !branding?.hidePoweredBy;

  const greetingMessage =
    branding?.initialMessage || "Hello! How can I assist you today?";

  return (
    <div className="flex-1 flex items-center justify-center">
      <Card className="w-[400px] h-[550px] shadow-lg border-1 py-0">
        {/* Header */}
        <div
          className="p-3 text-white flex items-center justify-between border-b rounded-t-xl bg-primary"
          style={{ backgroundColor: branding?.primaryColor }}
        >
          <p className="font-normal text-base">
            {branding?.name || "Chat Preview"}
          </p>
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

        <ScrollArea className="flex-1 h-[320px]">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="text-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <div>Error loading messages</div>
              </div>
            ) : (
              <div ref={messagesContainerRef} className="space-y-4">
                {messages.length === 0 && (
                  <GreetingMessage title={greetingMessage} />
                )}

                {/* Render messages */}

                {messages.map((message, index) => (
                  <div key={message.id} className="w-full overflow-hidden p-1">
                    <PreviewMessage
                      chatId={chatId}
                      message={message}
                      isLoading={
                        isStreamingLastMessage && messages.length - 1 === index
                      }
                      setMessages={setMessages}
                      reload={reload}
                    />
                  </div>
                ))}

                {status === "submitted" && isLastMessageFromUser && (
                  <ThinkingMessage />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </ScrollArea>

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
                  "--tw-ring-color": branding?.primaryColor,
                } as React.CSSProperties
              }
              autoComplete="off"
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              className="rounded-full"
              style={{ backgroundColor: branding?.primaryColor }}
              type="submit"
              size="icon"
              disabled={inputLength === 0}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>

          {showPoweredBy ? (
            <div className="flex py-2 items-center justify-center text-xs text-muted-foreground">
              <span>Powered by </span>
              <a
                href="https://padyna.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: branding?.primaryColor }}
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
