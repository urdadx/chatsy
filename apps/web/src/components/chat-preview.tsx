import { ArrowUp, MessageCircle, RefreshCcw, X } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ChatPreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    {
      role: "agent",
      content: "Hello! How can I assist you today?",
    },
    {
      role: "user",
      content: "Hi, I have a question about your services.",
    },
  ]);
  const [input, setInput] = React.useState("");
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputLength === 0) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Thanks for your message! I'll help you with that.",
        },
      ]);
    }, 500);
  };

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
            <Card className="w-[400px] h-[550px] shadow-lg border-1 py-3">
              <div className="flex flex-row items-center border-b justify-end px-2 pb-2">
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
                  <TooltipContent side="top">Close</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span className="sr-only">Close chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Reset chat</TooltipContent>
                </Tooltip>
              </div>

              <ScrollArea className="flex-1 h-[320px]">
                <CardContent className="p-4">
                  <div ref={messagesContainerRef} className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                            message.role === "user"
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "bg-muted",
                          )}
                        >
                          {message.content}
                        </motion.div>
                      ))
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative mb-4 h-[44px] w-[44px]">
                          <div className="flex flex-col items-center space-x-2">
                            <Avatar className="border-3 border-primary w-14 h-14">
                              <AvatarImage
                                src="https://avatars.githubusercontent.com/u/70736338?v=4"
                                alt="Image"
                                className="object-cover"
                              />
                              <AvatarFallback>JM</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <p className="mb-1 mt-2 hidden text-center text-sm font-medium text-black md:block dark:text-white">
                          What can I help you with?
                        </p>
                        <p className="mb-3 text-center text-sm text-[#8C8C8C] dark:text-[#929292]">
                          Ask me anything
                        </p>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </CardContent>
              </ScrollArea>

              <CardFooter className="flex flex-col space-y-2 ">
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    id="message"
                    placeholder="Type your message..."
                    className="flex-1"
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
                <div className="flex py-1 items-center justify-center text-xs text-muted-foreground">
                  <span>Powered by </span>
                  <a
                    href="https://chatsy.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 hover:underline text-primary"
                  >
                    Chatsy
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
