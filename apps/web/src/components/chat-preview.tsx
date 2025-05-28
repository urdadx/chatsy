import { ArrowUp } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "./ui/scroll-area";

export function ChatPreview() {
  const [messages, setMessages] = React.useState([
    {
      role: "agent",
      content: "Hi, how can I help you today?",
    },
    {
      role: "user",
      content: "Hey, I'm having trouble with my account.",
    },
    {
      role: "agent",
      content: "What seems to be the problem?",
    },
    {
      role: "user",
      content: "I can't log in.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;

  return (
    <div className="flex h-full w-[35%] border-l border-dashed items-center justify-center p-3">
      <Card className="h-[550px] ">
        <CardHeader className="flex flex-row items-center border-b">
          <div className="flex items-center space-x-2">
            <Avatar className="border-2 border-primary">
              <AvatarImage
                src="https://avatars.githubusercontent.com/u/70736338?v=4"
                alt="Image"
                className="object-cover"
                width={40}
                height={40}
              />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">Jack Maaye</p>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="h-[350px] pr-4">
          <CardContent>
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </CardContent>
        </ScrollArea>
        <CardFooter className="flex flex-col space-y-2 mt-auto sticky bottom-0 left-0 right-0 z-10">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputLength === 0) return;
              setMessages([
                ...messages,
                {
                  role: "user",
                  content: input,
                },
              ]);
              setInput("");
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(event: any) => setInput(event.target.value)}
            />
            <Button
              className="rounded-full"
              type="submit"
              size="icon"
              disabled={inputLength === 0}
            >
              <ArrowUp />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Powered by </span>
            <a
              href="https://chatsy.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex ml-1 items-center gap-1 hover:underline text-primary"
            >
              Chatsy
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
