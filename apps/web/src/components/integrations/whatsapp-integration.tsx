import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useChatbot } from "@/hooks/use-chatbot";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WhatsAppSettings {
  whatsappEnabled: boolean;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappWelcomeMessage: string;
  whatsappSettings: Record<string, any>;
  whatsappAccount?: {
    connected: boolean;
    businessAccountId: string;
  };
}

export function WhatsAppIntegration() {
  const { data: chatbot } = useChatbot();
  const queryClient = useQueryClient();

  const [isConnecting, setIsConnecting] = useState(false);
  const [settings, setSettings] = useState<Partial<WhatsAppSettings>>({
    whatsappEnabled: false,
    whatsappPhoneNumberId: "",
    whatsappBusinessAccountId: "",
    whatsappWelcomeMessage: "",
    whatsappSettings: {},
  });

  // Fetch WhatsApp settings for the current chatbot
  const { data: whatsappSettings, isLoading } = useQuery<WhatsAppSettings>({
    queryKey: ["whatsapp-settings", chatbot?.id],
    queryFn: async () => {
      if (!chatbot?.id) throw new Error("No chatbot ID");
      const response = await api.get(
        `/integrations/whatsapp/settings/${chatbot.id}`,
      );
      return response.data;
    },
    enabled: !!chatbot?.id,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<WhatsAppSettings>) => {
      if (!chatbot?.id) throw new Error("No chatbot ID");
      const response = await api.patch(
        `/integrations/whatsapp/settings/${chatbot.id}`,
        updates,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("WhatsApp settings updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["whatsapp-settings", chatbot?.id],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update settings");
    },
  });

  // Connect to WhatsApp Business
  const connectWhatsApp = async () => {
    if (!chatbot?.organizationId) {
      toast.error("No organization found");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await api.post("/integrations/whatsapp/auth/connect", {
        organizationId: chatbot.organizationId,
      });

      // Open OAuth window
      const authWindow = window.open(
        response.data.authUrl,
        "whatsapp-auth",
        "width=600,height=700,scrollbars=yes,resizable=yes",
      );

      // Listen for OAuth completion
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "whatsapp_connected") {
          authWindow?.close();
          window.removeEventListener("message", messageHandler);

          if (event.data.success) {
            toast.success("WhatsApp connected successfully!");
            queryClient.invalidateQueries({
              queryKey: ["whatsapp-settings", chatbot?.id],
            });
          } else {
            toast.error("Failed to connect WhatsApp");
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
        error.response?.data?.error || "Failed to initiate WhatsApp connection",
      );
    }
  };

  // Update local settings when data is fetched
  useEffect(() => {
    if (whatsappSettings) {
      setSettings({
        whatsappEnabled: whatsappSettings.whatsappEnabled,
        whatsappPhoneNumberId: whatsappSettings.whatsappPhoneNumberId,
        whatsappBusinessAccountId: whatsappSettings.whatsappBusinessAccountId,
        whatsappWelcomeMessage: whatsappSettings.whatsappWelcomeMessage,
        whatsappSettings: whatsappSettings.whatsappSettings,
      });
    }
  }, [whatsappSettings]);

  const handleSettingChange = (key: keyof WhatsAppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const isConnected = whatsappSettings?.whatsappAccount?.connected;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp Business Integration
        </CardTitle>
        <CardDescription>
          Connect your WhatsApp Business account to enable customers to chat
          with your AI bot via WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`}
            />
            <div>
              <p className="font-medium">
                {isConnected
                  ? "Connected to WhatsApp Business"
                  : "Not Connected"}
              </p>
              {isConnected && whatsappSettings?.whatsappAccount && (
                <p className="text-sm text-muted-foreground">
                  Business Account:{" "}
                  {whatsappSettings.whatsappAccount.businessAccountId}
                </p>
              )}
            </div>
          </div>
          {!isConnected && (
            <Button onClick={connectWhatsApp} disabled={isConnecting}>
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Connecting...
                </div>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect WhatsApp
                </>
              )}
            </Button>
          )}
          {isConnected && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              Connected
            </div>
          )}
        </div>

        {/* Settings Form */}
        {isConnected && (
          <div className="space-y-4">
            {/* Enable/Disable WhatsApp */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whatsapp-enabled">
                  Enable WhatsApp Integration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to interact with your bot via WhatsApp
                </p>
              </div>
              <Switch
                id="whatsapp-enabled"
                checked={settings.whatsappEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("whatsappEnabled", checked)
                }
              />
            </div>

            {settings.whatsappEnabled && (
              <>
                {/* Phone Number ID */}
                <div className="space-y-2">
                  <Label htmlFor="phone-number-id">
                    WhatsApp Phone Number ID
                  </Label>
                  <div className="flex gap-2">
                    <Phone className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="phone-number-id"
                      placeholder="Enter your WhatsApp Business phone number ID"
                      value={settings.whatsappPhoneNumberId}
                      onChange={(e) =>
                        handleSettingChange(
                          "whatsappPhoneNumberId",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can find this in your WhatsApp Business API settings
                  </p>
                </div>

                {/* Business Account ID */}
                <div className="space-y-2">
                  <Label htmlFor="business-account-id">
                    WhatsApp Business Account ID
                  </Label>
                  <Input
                    id="business-account-id"
                    placeholder="Enter your WhatsApp Business account ID"
                    value={settings.whatsappBusinessAccountId}
                    onChange={(e) =>
                      handleSettingChange(
                        "whatsappBusinessAccountId",
                        e.target.value,
                      )
                    }
                  />
                </div>

                {/* Welcome Message */}
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Enter a welcome message for WhatsApp users..."
                    value={settings.whatsappWelcomeMessage}
                    onChange={(e) =>
                      handleSettingChange(
                        "whatsappWelcomeMessage",
                        e.target.value,
                      )
                    }
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be sent when users first contact your bot
                    on WhatsApp
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {!isConnected && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create a WhatsApp Business account if you don't have one</li>
              <li>Set up WhatsApp Business API access</li>
              <li>Click "Connect WhatsApp" to link your account</li>
              <li>Configure your phone number and welcome message</li>
              <li>Enable the integration to start receiving messages</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
