import CalendlyLogo from "@/assets/calendly.png"
import { useChatbot } from "@/hooks/use-chatbot";
import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";

interface CalendlySettings {
  chatbotId: string;
  calendlyAccount?: {
    connected: boolean;
    organizationUri: string;
    userUri: string;
    eventTypes: any[];
  } | null;
}

export const CalendlyIntegrationCard = () => {
  const { data: chatbot } = useChatbot();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch Calendly settings for the current chatbot
  const { data: calendlySettings } = useQuery<CalendlySettings>({
    queryKey: ["calendly-settings", chatbot?.id],
    queryFn: async () => {
      if (!chatbot?.id) throw new Error("No chatbot ID");
      const response = await api.get(
        `/integrations/calendly/settings/${chatbot.id}`,
      );
      return response.data;
    },
    enabled: !!chatbot?.id,
  });

  const isConnected = !!calendlySettings?.calendlyAccount?.connected;

  const disconnectCalendly = async () => {
    if (!chatbot?.id) return;
    setIsConnecting(true);
    try {
      await api.post("/integrations/calendly/auth/disconnect", { chatbotId: chatbot.id });
      toast.success("Calendly disconnected");
      queryClient.invalidateQueries({ queryKey: ["calendly-settings", chatbot.id] });
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to disconnect");
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect to Calendly
  const connectCalendly = async () => {
    if (!chatbot?.organizationId) {
      toast.error("No organization found");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await api.post("/integrations/calendly/auth/connect", {
        organizationId: chatbot.organizationId,
      });

      const authWindow = window.open(
        response.data.authUrl,
        "calendly-auth",
        "width=600,height=600,scrollbars=yes,resizable=yes",
      );

      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "calendly_connected") {
          authWindow?.close();
          window.removeEventListener("message", messageHandler);

          if (event.data.success) {
            toast.success("Calendly connected successfully!");
            queryClient.invalidateQueries({
              queryKey: ["calendly-settings", chatbot?.id],
            });
          } else {
            toast.error("Failed to connect Calendly");
          }
          setIsConnecting(false);
        }
      };

      window.addEventListener("message", messageHandler);

      // Handle window closed manually
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageHandler);
          setIsConnecting(false);
        }
      }, 1000);
    } catch (error: any) {
      setIsConnecting(false);
      toast.error(
        error.response?.data?.error || "Failed to initiate Calendly connection",
      );
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs w-full max-w-xs mx-auto h-full">
        <div className="flex flex-col gap-3 sm:gap-4 h-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img className="size-9" src={CalendlyLogo} alt="integration-icon" />
            </div>
            {isConnected && (
              <Badge variant="outline" className="gap-1.5">
                <span className="size-2 rounded-full bg-green-500"></span>
                Connected
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-sm sm:text-md">Calendly</h3>
          <p className="text-gray-600 text-xs sm:text-sm flex-grow">
            Connect your bot to Calendly to manage bookings and meetings.
          </p>
          <Button
            className="w-fit rounded-sm"
            variant="outline"
            onClick={isConnected ? disconnectCalendly : connectCalendly}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Spinner />
                {isConnected ? "Disconnecting" : "Connecting"}
              </>
            ) : (
              <>{isConnected ? "Disconnect" : "Connect"}</>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}