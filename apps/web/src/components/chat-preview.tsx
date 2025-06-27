import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChatWithReset } from "@/hooks/use-chat-reset";
import { ChatSDKError } from "@/lib/errors";
import { cn, fetchWithErrorHandlers } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, RefreshCcw, Settings, X } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { PreviewMessage, ThinkingMessage } from "./message";
import { AISuggestion, AISuggestions } from "./ui/ai-suggestions";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ChatPreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { chatId, resetChat } = useChatWithReset();

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
    fetch: fetchWithErrorHandlers,
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast.error(error.message);
      }
    },
  });

  const inputLength = input.trim().length;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleResetChat = useCallback(() => {
    resetChat();
    setMessages([]);
    setInput("");
    toast.success("Chat reset successfully");
  }, [resetChat, setMessages, setInput]);

  const suggestions = [
    "What are the latest trends in AI?",
    "How does machine learning work?",
    "Explain quantum computing",
  ];

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
            <Card className="w-[400px] h-[550px] shadow-lg border-1 py-0 ">
              <div className="bg-primary p-3 text-white flex flex-row items-center border-b justify-between px-2 pb-2 rounded-t-xl">
                <p className="font-normal px-1 text-sm">Chat Preview</p>
                <div>
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
                        <Settings />
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

              <ScrollArea className="flex-1 h-[320px]">
                <CardContent className="p-4">
                  <div ref={messagesContainerRef} className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        className="w-full overflow-hidden p-1"
                        key={message.id}
                      >
                        <PreviewMessage
                          chatId={chatId}
                          message={message}
                          isLoading={
                            status === "streaming" &&
                            messages.length - 1 === index
                          }
                          setMessages={setMessages}
                          reload={reload}
                        />
                      </div>
                    ))}
                    {status === "submitted" &&
                      messages.length > 0 &&
                      messages[messages.length - 1].role === "user" && (
                        <ThinkingMessage />
                      )}
                  </div>
                  <div ref={messagesEndRef} />
                </CardContent>
              </ScrollArea>

              <CardFooter className="flex flex-col space-y-2 ">
                <AISuggestions className="">
                  {suggestions.map((suggestion) => (
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

      <motion.div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
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
