import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatHistory } from "@/hooks/use-chat-history";
import { RiChat1Line, RiTelegramFill, RiWhatsappLine } from "@remixicon/react";
import { useSearch } from "@tanstack/react-router";
import { Globe, Maximize2, MessageCircle } from "lucide-react";
import { useState } from "react";
import Spinner from "../ui/spinner";
import BarList from "./bar-list";
import { ViewAllStats } from "./view-all-stats";

interface ChatsByChannelProps {
  chatData?: any[];
}

// Channel display configuration
const channelConfig = {
  web: {
    label: "Website",
    icon: Globe,
    description: "Bio pages and direct links",
    color: "bg-blue-200",
    hoverColor: "hover:bg-blue-50",
  },
  widget: {
    label: "Widget",
    icon: RiChat1Line,
    description: "Embedded chat bubbles",
    color: "bg-green-200",
    hoverColor: "hover:bg-green-50",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: RiWhatsappLine,
    description: "WhatsApp Business messages",
    color: "bg-green-200",
    hoverColor: "hover:bg-green-50",
  },
  telegram: {
    label: "Telegram",
    icon: RiTelegramFill,
    description: "Telegram bot messages",
    color: "bg-sky-200",
    hoverColor: "hover:bg-sky-50",
  },
};

export function ChatsByChannel({
  chatData: propChatData,
}: ChatsByChannelProps) {
  const { timeRange } = useSearch({ from: "/admin/analytics" });

  // Use prop data if provided, otherwise fetch it
  const { data: fetchedChatData, isLoading: chatsPending } = useChatHistory(
    (timeRange as "24h" | "7d" | "30d" | "90d") || "24h",
  );

  // Flatten all pages of chats
  const allChats =
    propChatData ||
    (fetchedChatData?.pages
      ? fetchedChatData.pages.flatMap((page) => page.chats || [])
      : []);

  const [channelsDialogOpen, setChannelsDialogOpen] = useState(false);

  // Aggregate chats by channel
  const channelMap: Record<string, number> = {};
  const channelDetailsMap: Record<
    string,
    Array<{ title: string; createdAt: string }>
  > = {};

  if (Array.isArray(allChats)) {
    allChats.forEach((chat) => {
      const channel = chat.channel || "web"; // Default to web if no channel specified
      channelMap[channel] = (channelMap[channel] || 0) + 1;

      if (!channelDetailsMap[channel]) {
        channelDetailsMap[channel] = [];
      }
      channelDetailsMap[channel].push({
        title: chat.title || "Untitled Chat",
        createdAt: chat.createdAt,
      });
    });
  }

  // Convert channel data to display format
  const allChannels = Object.entries(channelMap).map(
    ([channel, totalCount]) => {
      const config = channelConfig[channel as keyof typeof channelConfig] || {
        label: channel,
        icon: MessageCircle,
        description: "Unknown channel",
        color: "bg-gray-200",
        hoverColor: "hover:bg-gray-50",
      };

      const IconComponent = config.icon;

      return {
        icon: <IconComponent className="w-4 h-4 text-gray-600" />,
        title: config.label,
        href: "",
        value: totalCount,
        linkId: "",
        description: config.description,
      };
    },
  );

  const topChannels = allChannels.slice(0, 5);
  const hasMoreChannels = allChannels.length > 5;
  const maxChannelCount =
    allChannels.length > 0
      ? Math.max(...allChannels.map((channel) => channel.value))
      : 0;

  return (
    <div className="h-[350px] w-full rounded-xl border bg-white flex flex-col overflow-hidden">
      <Tabs defaultValue="tab-1" className="flex flex-col h-full">
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <TabsList className="h-auto gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
            <TabsTrigger
              value="tab-1"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Sources
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> Channels
            </div>
          </div>
        </div>

        {/* Content area - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="tab-1" className="h-full m-0 p-0">
            {chatsPending ? (
              <div className="h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : allChannels.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm opacity-80">
                  No chat data available
                </span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content area - scrollable if needed */}
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Channels"
                    unit="chats"
                    data={topChannels}
                    barBackground="bg-purple-200"
                    hoverBackground="hover:bg-purple-50"
                    maxValue={maxChannelCount}
                  />
                </div>
                {/* Button area - fixed at bottom */}
                {hasMoreChannels && (
                  <div className="flex-shrink-0 px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setChannelsDialogOpen(true)}
                        className="text-sm py-2 px-4 rounded-full shadow-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <ViewAllStats
              name={"channels"}
              dialogOpen={channelsDialogOpen}
              setDialogOpen={setChannelsDialogOpen}
              allLinks={allChannels}
              maxTotalCount={maxChannelCount}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
