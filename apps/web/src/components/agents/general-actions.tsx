import { Calendar, Headset, MessageCircle, Users } from "lucide-react";
import { useState } from "react";
import { ActionIcon } from "./action-icon";
import { ActionCard } from "./actions-card";
import { SearchActions } from "./search-actions";

export const Actions = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const actionsData = [
    {
      icon: (
        <ActionIcon>
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
        </ActionIcon>
      ),
      name: "Feedback form",
      description: "Collects feedback from users using a form",
    },
    {
      icon: (
        <ActionIcon>
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
        </ActionIcon>
      ),
      name: "Collect leads",
      description: "Captures leads from conversations with customers",
    },
    {
      icon: (
        <ActionIcon>
          <Headset className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
        </ActionIcon>
      ),
      name: "Escalate to human",
      description: "Transfers conversation to a human agent",
    },
    {
      icon: (
        <ActionIcon>
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
        </ActionIcon>
      ),
      name: "Schedule appointment",
      description: "Lets customers book appointments with you",
    },
  ];

  const filteredActions = actionsData.filter(
    (action) =>
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="pt-4 flex flex-col justify-between items-center w-full gap-3">
        <div className="flex justify-between items-center w-full ">
          <SearchActions value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-3">
          {filteredActions.map((action) => (
            <ActionCard
              key={action.name}
              icon={action.icon}
              name={action.name}
              description={action.description}
            />
          ))}
        </div>
      </div>
    </>
  );
};
