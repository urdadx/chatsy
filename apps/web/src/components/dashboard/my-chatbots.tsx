import type { ChatbotsResponse } from "@/hooks/use-chatbot-management";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChatbotCard } from "../workspace/chatbot-card";
import { ChatbotManager } from "../workspace/new-chabot";

interface MyChatbotsProps {
  chatbotsData: ChatbotsResponse | undefined;
}

export const MyChatbots = ({ chatbotsData }: MyChatbotsProps) => {
  const [openChatbot, setOpenChatbot] = useState(false);

  const handleCreateBot = () => {
    setOpenChatbot(true);
  };

  return (
    <>
      <ChatbotManager open={openChatbot} setOpen={setOpenChatbot} />

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold ">All chatbots</h2>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleCreateBot}>Create new chatbot</Button>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chatbotsData?.chatbots?.map((chatbot) => (
            <ChatbotCard
              key={chatbot.id}
              chatbotId={chatbot.id}
              name={chatbot.name}
              logo={chatbot.image}
              createdAt={chatbot.createdAt}
            />
          ))}
        </div>
      </div>
    </>
  );
};
