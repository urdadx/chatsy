import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSetActiveChatbot } from "@/hooks/use-chatbot";
import { timeAgo } from "@/lib/utils";
import { ArrowRightLeft, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteChatbot } from "./delete-chatbot";

interface ChatbotCardProps {
  chatbotId: string;
  name: string;
  logo: string | null | undefined;
  createdAt: Date;
}

export function ChatbotCard({
  chatbotId,
  name,
  logo,
  createdAt,
}: ChatbotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const setActiveChatbotMutation = useSetActiveChatbot();

  const handleSwitchChatbot = async () => {
    try {
      await setActiveChatbotMutation.mutateAsync({ chatbotId });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };


  return (
    <>
      <div className="w-full max-w-sm ">
        <div className="overflow-hidden border rounded-xl">
          <div className="relative h-24 overflow-hidden">
            {logo ? (
              <img
                src={logo}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={`https://api.dicebear.com/9.x/glass/svg?seed=${name}`}
                alt={name}
                className="w-full h-full object-cover"
              />)}
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-md">{name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Created {timeAgo(createdAt)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-gray-500"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleSwitchChatbot}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Switch
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setIsDeleting(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      {isDeleting && (
        <DeleteChatbot
          chatbotId={chatbotId}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
