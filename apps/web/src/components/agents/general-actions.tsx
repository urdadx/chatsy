import { motion } from "framer-motion";
import { Calendar, Headset, MessageSquare, Users } from "lucide-react";
import { SearchQuestions } from "../playground/search-questions";
import { Button } from "../ui/button";
import { ActionIcon } from "./action-icon";
import { ActionCard } from "./actions-card";

export const Actions = () => {
  return (
    <>
      <div className="pt-4 flex flex-col justify-between items-center w-full gap-3">
        <div className="flex justify-between items-center w-full ">
          <SearchQuestions />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button>Create custom action</Button>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
          <ActionCard
            icon={
              <ActionIcon>
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </ActionIcon>
            }
            name="Feedback form"
            description="Collects feedback from users using a form"
          />

          <ActionCard
            icon={
              <ActionIcon>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </ActionIcon>
            }
            name="Collect leads"
            description="Captures leads from conversations with customers"
          />
          <ActionCard
            icon={
              <ActionIcon>
                <Headset className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </ActionIcon>
            }
            name="Escalete to human"
            description="Transfers conversation to a human agent"
          />

          <ActionCard
            icon={
              <ActionIcon>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              </ActionIcon>
            }
            name="Schedule appointment"
            description="Lets customers book appointments with you"
          />
        </div>
      </div>
    </>
  );
};
