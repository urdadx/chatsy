import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { authClient } from "@/lib/auth-client";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import Avatar from "boring-avatars";
import { ChevronsUpDown, PlusIcon, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { InviteMembers } from "./invite-members";
import { ChatbotManager } from "./new-chabot";

export function ChatbotSwitcher() {
  const { data: chatbotsData, isLoading } = useChatbots();
  const setActiveChatbotMutation = useSetActiveChatbot();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

  const handleSwitchChatbot = async (chatbotId: string) => {
    try {
      await setActiveChatbotMutation.mutateAsync({ chatbotId });
      setOpen(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const [openCreateChatbot, setOpenCreateChatbot] = useState(false);
  const [inviteMembersOpen, setInviteMembersOpen] = useState(false);

  const handleCreateChatbot = () => {
    setOpenCreateChatbot(true);
    setOpen(false);
  };

  const handleInviteMembers = () => {
    setInviteMembersOpen(true);
    setOpen(false);
  };

  const triggerButton = (
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
  );

  const menuContent = (
    <>
      <div className="p-2">
        {isAdmin && (
          <button
            type="button"
            onClick={handleInviteMembers}
            className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <UserRoundPlus className="text-primary h-4 w-4" />
            <span className="text-primary">Invite team members</span>
          </button>
        )}
      </div>

      {chatbotsData?.chatbots && chatbotsData.chatbots.length > 0 && (
        <>
          <div className="px-4 py-2 border-t">
            <span className="text-xs font-medium text-muted-foreground">
              Chatbots
            </span>
          </div>
          <div className="p-2 space-y-1">
            {chatbotsData.chatbots.map((chatbot) => (
              <button
                key={chatbot.id}
                type="button"
                onClick={() => handleSwitchChatbot(chatbot.id)}
                className={`flex items-center gap-2 w-full p-2 rounded transition-colors ${
                  chatbot.id === activeChatbot?.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-gray-100"
                }`}
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

                <span className="truncate max-w-[120px] block text-left">
                  {chatbot.name}
                </span>
                {chatbot.id === activeChatbot?.id && (
                  <RiCheckboxCircleFill className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="p-2 border-t">
        <button
          type="button"
          onClick={handleCreateChatbot}
          className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Create new chatbot
        </button>
      </div>
    </>
  );

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

  if (isDesktop) {
    return (
      <>
        <ChatbotManager
          open={openCreateChatbot}
          setOpen={setOpenCreateChatbot}
        />
        <InviteMembers
          open={inviteMembersOpen}
          setOpen={setInviteMembersOpen}
        />
        <SidebarMenu>
          <SidebarMenuItem className="bg-transparent border-2 rounded-lg p-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-58 rounded-lg"
                side="bottom"
                align="end"
              >
                {isAdmin && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleInviteMembers}>
                        <UserRoundPlus className="text-primary" />
                        <span className="text-primary hover:text-primary">
                          Invite team members
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}

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

  return (
    <>
      <ChatbotManager open={openCreateChatbot} setOpen={setOpenCreateChatbot} />
      <InviteMembers open={inviteMembersOpen} setOpen={setInviteMembersOpen} />
      <SidebarMenu>
        <SidebarMenuItem className="bg-transparent border-2 rounded-lg p-1">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
            <DrawerContent className="p-4">
              <DrawerHeader className="text-left"></DrawerHeader>
              {menuContent}
            </DrawerContent>
          </Drawer>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
