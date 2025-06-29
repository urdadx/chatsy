import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DBMessage } from "@/db/schema";
import { useChatWithReset } from "@/hooks/use-chat-reset";
import { useMessages } from "@/hooks/use-db-messages";
import { ChatSDKError } from "@/lib/errors";
import { cn, fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, RefreshCcw, Settings, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PreviewMessage, ThinkingMessage } from "./message";
import { AISuggestion, AISuggestions } from "./ui/ai-suggestions";
import { ScrollArea } from "./ui/scroll-area";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    content: "",
    createdAt: message.createdAt,
  }));
}

const SUGGESTIONS = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
];

export function ChatPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const { chatId, resetChat } = useChatWithReset();
  const { data: messagesFromDb, isLoading, error } = useMessages(chatId);

  const initialMessages = messagesFromDb
    ? convertToUIMessages(messagesFromDb)
    : [];

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
  }, [resetChat, setMessages, setInput]);

  const handleToggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching messages:", error);
    }
  }, [error]);

  const isLastMessageFromUser =
    messages.length > 0 && messages[messages.length - 1].role === "user";
  const isStreamingLastMessage = status === "streaming" && messages.length > 0;

  return (
    <div className="fixed bottom-2 right-4 z-50 transition-opacity duration-200">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-2 right-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ transformOrigin: "bottom right" }}
          >
            <Card className="w-[400px] h-[550px] shadow-lg border-1 py-0">
              {/* Header */}
              <div className="bg-primary p-3 text-white flex items-center justify-between border-b rounded-t-xl">
                <p className="font-normal text-sm">Chat Preview</p>
                <div className="flex">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close chat</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-white text-primary"
                      side="top"
                    >
                      Close
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-white text-primary"
                      side="top"
                    >
                      Settings
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleResetChat}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        <span className="sr-only">Reset chat</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-white text-primary"
                      side="top"
                    >
                      Reset chat
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Messages Area */}
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
                <AISuggestions>
                  {SUGGESTIONS.map((suggestion) => (
                    <AISuggestion key={suggestion} suggestion={suggestion} />
                  ))}
                </AISuggestions>

                <form
                  onSubmit={handleSubmit}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    id="message"
                    placeholder="Chat with me..."
                    className="flex-1 text-sm sm:text-base"
                    autoComplete="off"
                    autoFocus
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  <Button
                    className="rounded-full"
                    type="submit"
                    size="icon"
                    disabled={inputLength === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>

                <div className="flex py-2 items-center justify-center text-xs text-muted-foreground">
                  <span>Powered by </span>
                  <a
                    href="https://padyna.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 hover:underline text-primary"
                  >
                    Padyna
                  </a>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggleOpen}
              className={cn(
                "rounded-full w-14 h-14 shadow-2xl bg-primary hover:bg-primary/90 border-2 border-white",
                isOpen && "hidden",
              )}
              size="icon"
            >
              <motion.div
                key="message"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={5}
            className="bg-white text-black shadow-lg"
          >
            <p className="text-sm text-black">Toggle chat preview</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </div>
  );
}
