import { useChatbot } from "@/hooks/use-chatbot";
import { RiBardFill } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { ResponseStream } from "./response-stream";

export const GreetingMessage = ({ title, chatbot: chatbotProp }: any) => {
  const { data: hookChatbot } = useChatbot();
  const chatbot = chatbotProp ?? hookChatbot;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="w-full mx-auto max-w-3xl group/message"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3 w-full  group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl">
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
              {chatbot?.image ? (
                <img
                  src={chatbot.image}
                  alt="Assistant"
                  className="rounded-full"
                />
              ) : (
                <RiBardFill size={14} />
              )}
            </div>
            <div className="flex flex-row gap-2 items-start">
              <div
                data-testid="message-content"
                className="flex flex-col gap-4 text-foreground bg-gray-50 prose px-3 py-2 rounded-md break-words whitespace-normal"
              >
                <ResponseStream
                  textStream={title}
                  mode="typewriter"
                  speed={25}
                  className="text-sm  "
                />{" "}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
