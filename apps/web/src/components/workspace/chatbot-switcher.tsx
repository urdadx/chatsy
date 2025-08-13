import { ChevronsUpDown, PlusIcon, UserRoundPlus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  useChatbots,
  useSetActiveChatbot,
} from "@/hooks/use-chatbot-management";
import { RiCheckboxCircleFill } from "@remixicon/react";
import Avatar from "boring-avatars";
import { useMemo, useState } from "react";
import { InviteMembers } from "./invite-members";
import { ChatbotManager } from "./new-chabot";

export function ChatbotSwitcher() {
  const { data: chatbotsData, isLoading } = useChatbots();
  const setActiveChatbotMutation = useSetActiveChatbot();

  const activeChatbot = useMemo(() => {
    if (!chatbotsData?.chatbots || !chatbotsData?.activeChatbotId) return null;
    return chatbotsData.chatbots.find(
      (chatbot) => chatbot.id === chatbotsData.activeChatbotId,
    );
  }, [chatbotsData]);

  const currentLogo = useMemo(
    () => activeChatbot?.image,
    [activeChatbot?.image],
  );

  const handleSwitchChatbot = async (chatbotId: string) => {
    try {
      await setActiveChatbotMutation.mutateAsync({ chatbotId });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const [openCreateChatbot, setOpenCreateChatbot] = useState(false);
  const [inviteMembersOpen, setInviteMembersOpen] = useState(false);

  const handleCreateChatbot = () => {
    setOpenCreateChatbot(true);
  };

  const handleInviteMembers = () => {
    setInviteMembersOpen(true);
  };

  if (isLoading) {
    return (
      <SidebarMenu className="">
        <SidebarMenuItem className="bg-sidebar rounded-lg p-1">
          <SidebarMenuButton size="lg" disabled>
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="grid flex-1 text-left leading-tight">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <ChatbotManager open={openCreateChatbot} setOpen={setOpenCreateChatbot} />
      <InviteMembers open={inviteMembersOpen} setOpen={setInviteMembersOpen} />
      <SidebarMenu>
        <SidebarMenuItem className="bg-transparent border-2 rounded-lg p-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="default"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {currentLogo ? (
                  <div className="rounded-full w-4 h-4">
                    <img
                      src={currentLogo}
                      alt={activeChatbot?.name}
                      className="h-full w-full rounded-full object-cover "
                    />
                  </div>
                ) : (
                  <Avatar name={activeChatbot?.name} size={200} />
                )}

                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-normal">
                    {activeChatbot?.name || "No chatbot selected"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-58 rounded-lg"
              side="bottom"
              align="end"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleInviteMembers}>
                  <UserRoundPlus className="text-primary" />
                  <span className="text-primary hover:text-primary">
                    Invite team members
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {chatbotsData?.chatbots && chatbotsData.chatbots.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs">
                    Chatbots
                  </DropdownMenuLabel>
                  <DropdownMenuGroup className="space-y-1">
                    {chatbotsData.chatbots.map((chatbot) => (
                      <DropdownMenuItem
                        key={chatbot.id}
                        onClick={() => handleSwitchChatbot(chatbot.id)}
                        className={
                          chatbot.id === activeChatbot?.id
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }
                      >
                        {chatbot.image ? (
                          <img
                            src={chatbot.image}
                            alt={chatbot.name}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <Avatar
                            name={chatbot.name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}

                        <span className="truncate max-w-[120px] block">
                          {chatbot.name}
                        </span>
                        {chatbot.id === activeChatbot?.id && (
                          <RiCheckboxCircleFill className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}

              <DropdownMenuGroup className="mt-2">
                <DropdownMenuItem onClick={handleCreateChatbot}>
                  <PlusIcon />
                  Create new chatbot
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
