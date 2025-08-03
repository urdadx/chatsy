import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useChatbot } from "@/hooks/use-chatbot";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { IntegrationIcon } from "./integration-icon";

interface PhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  status: string;
}

interface WhatsAppAccount {
  connected: boolean;
  businessAccountId: string;
  phoneNumbers: PhoneNumber[];
}

interface WhatsAppSettings {
  whatsappEnabled: boolean;
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappWelcomeMessage: string;
  whatsappSettings: Record<string, any>;
  whatsappAccount?: WhatsAppAccount;
}

interface WhatsAppDialogProps {
  children: React.ReactNode;
}

export function WhatsAppDialog({ children }: WhatsAppDialogProps) {
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

  const handleSaveSettings = async () => {
    // Auto-populate business account ID from connected account
    const updatedSettings = {
      ...settings,
      whatsappBusinessAccountId:
        whatsappSettings?.whatsappAccount?.businessAccountId ||
        settings.whatsappBusinessAccountId,
    };
    await updateSettingsMutation.mutateAsync(updatedSettings);
  };

  const isConnected = whatsappSettings?.whatsappAccount?.connected;
  const phoneNumbers = whatsappSettings?.whatsappAccount?.phoneNumbers || [];
  const businessAccountId =
    whatsappSettings?.whatsappAccount?.businessAccountId;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base font-medium gap-2">
            <IntegrationIcon>
              <img
                src="https://img.icons8.com/color/48/whatsapp--v1.png"
                alt="Whatsapp"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </IntegrationIcon>{" "}
            WhatsApp Business
          </DialogTitle>
          <DialogDescription className="pt-2">
            Connect your WhatsApp Business account to enable customers to chat
            with your bot via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-300"}`}
                  />
                  <span className="font-medium">
                    {isConnected ? "Connected" : "Not Connected"}
                  </span>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    WhatsApp Business connected
                  </div>
                ) : (
                  <Button onClick={connectWhatsApp} disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect WhatsApp
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Show Business Account Info when connected */}
              {isConnected && businessAccountId && (
                <div className="mt-3 p-3 bg-green-50 rounded-md">
                  <p className="text-sm font-medium text-green-800">
                    Connected Business Account
                  </p>
                  <p className="text-sm text-green-600">
                    ID: {businessAccountId}
                  </p>
                  {phoneNumbers.length > 0 && (
                    <p className="text-sm text-green-600">
                      {phoneNumbers.length} phone number
                      {phoneNumbers.length !== 1 ? "s" : ""} available
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Settings (only show if connected) */}
            {isConnected && (
              <>
                {/* Enable WhatsApp */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-enabled">
                      Enable WhatsApp Integration
                    </Label>
                    <p className="text-sm text-gray-600">
                      Allow customers to chat with your bot via WhatsApp
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

                {/* Phone Number Selection */}
                <div className="space-y-2">
                  <Label htmlFor="phone-number">
                    WhatsApp Phone Number
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  {phoneNumbers.length > 0 ? (
                    <Select
                      value={settings.whatsappPhoneNumberId}
                      onValueChange={(value) =>
                        handleSettingChange("whatsappPhoneNumberId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phone number" />
                      </SelectTrigger>
                      <SelectContent>
                        {phoneNumbers.map((phone) => (
                          <SelectItem key={phone.id} value={phone.id}>
                            <div className="flex flex-col">
                              <span>{phone.display_phone_number}</span>
                              <span className="text-sm text-gray-500">
                                {phone.verified_name} • {phone.status}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        No phone numbers found. Please set up a phone number in
                        your WhatsApp Business API account.
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Select which phone number customers will message
                  </p>
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
                  <p className="text-sm text-gray-600">
                    This message will be sent to users when they first message
                    your bot on WhatsApp
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={
                      updateSettingsMutation.isPending ||
                      phoneNumbers.length === 0
                    }
                  >
                    {updateSettingsMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Setup Instructions */}
            {!isConnected && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
                  <li>Create a WhatsApp Business account</li>
                  <li>Set up the WhatsApp Business API</li>
                  <li>Click "Connect WhatsApp" to authenticate</li>
                  <li>
                    Your business account and phone numbers will be
                    automatically detected
                  </li>
                  <li>
                    Select your preferred phone number and configure settings
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
