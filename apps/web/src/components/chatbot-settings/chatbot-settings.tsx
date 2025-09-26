import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatbot, useUpdateChatbot } from "@/hooks/use-chatbot";
import { authClient, useSession } from "@/lib/auth-client";
import { InfoIcon, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddOnsDialog } from "../add-ons-dialog";
import { AvatarUpload } from "../avatar-upload";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Separator } from "../ui/separator";
import Spinner from "../ui/spinner";
import { PickColor } from "./pick-color";
import { WidgetSettings } from "./widget-settings";

export function ChatbotSettings() {
  const { data: chatbot, error, refetch, isLoading } = useChatbot();
  const updateChatbotMutation = useUpdateChatbot();
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [hidePoweredBy, setHidePoweredBy] = useState(
    chatbot?.hidePoweredBy || false,
  );
  const [initialMessage, setInitialMessage] = useState("");
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [showSuggestedInput, setShowSuggestedInput] = useState(false);
  const [addonsDialogOpen, setAddonsDialogOpen] = useState(false);

  useEffect(() => {
    setName(chatbot?.name || "");
    setHidePoweredBy(chatbot?.hidePoweredBy || false);
    setInitialMessage(chatbot?.initialMessage || "");
    setSuggestedMessages(chatbot?.suggestedMessages || []);
  }, [chatbot]);

  const updateChatbot = async (updates: Partial<typeof chatbot>) => {
    if (!chatbot) return;

    try {
      const updatedChatbot = {
        ...chatbot,
        ...updates,
      };
      await updateChatbotMutation.mutateAsync(updatedChatbot);
    } catch (error) {
      toast.error("Failed to update");
      console.error("Error updating branding:", error);
    }
  };

  const handleNameBlur = () => {
    if (!chatbot || name === chatbot.name) return;
    updateChatbot({ name });
  };

  const handleHidePoweredByChange = async (checked: boolean) => {
    if (checked) {
      // Check if user has remove-branding subscription
      const organizationId = session?.session?.activeOrganizationId;

      if (!organizationId) {
        toast.error("No active organization found");
        return;
      }

      try {
        const { data: subscriptions } =
          await authClient.customer.subscriptions.list({
            query: {
              page: 1,
              limit: 10,
              active: true,
              referenceId: organizationId,
            },
          });

        // Check if user has remove-branding subscription
        const hasRemoveBrandingSubscription =
          subscriptions?.result?.items?.some((sub) => {
            return (
              sub.product?.name?.toLowerCase().includes("remove") &&
              sub.product?.name?.toLowerCase().includes("branding")
            );
          });

        if (!hasRemoveBrandingSubscription) {
          setAddonsDialogOpen(true);
          return;
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast.error("Unable to verify subscription status");
        return;
      }
    }

    setHidePoweredBy(checked);
    updateChatbot({ hidePoweredBy: checked });
  };

  const handleInitialMessageBlur = () => {
    if (!chatbot || initialMessage === chatbot.initialMessage) return;
    updateChatbot({ initialMessage });
  };

  const handleSuggestedMessageChange = (index: number, value: string) => {
    const newMessages = [...suggestedMessages];
    newMessages[index] = value;
    setSuggestedMessages(newMessages);
  };

  const handleSuggestedMessageBlur = () => {
    const filteredMessages = suggestedMessages.filter(
      (msg) => msg.trim() !== "",
    );
    updateChatbot({ suggestedMessages: filteredMessages });
  };

  const addSuggestedMessage = () => {
    if (suggestedMessages.length < 4) {
      setSuggestedMessages([...suggestedMessages, ""]);
      setShowSuggestedInput(true);
    }
  };

  const removeSuggestedMessage = (index: number) => {
    const newMessages = suggestedMessages.filter((_, i) => i !== index);
    setSuggestedMessages(newMessages);
    updateChatbot({
      suggestedMessages: newMessages.filter((msg) => msg.trim() !== ""),
    });
    if (newMessages.length === 0) {
      setShowSuggestedInput(false);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full mx-auto px-2 sm:px-0">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-red-50 p-3">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              Unable to load chatbot settings
            </h3>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-0">
      <div className="space-y-8 mt-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="logo">Chatbot Logo</Label>
          <div className="h-10">
            <AvatarUpload />
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <Input
              id="name"
              className="w-full sm:w-[300px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              disabled={updateChatbotMutation.isPending}
            />
            {updateChatbotMutation.isPending && name !== chatbot?.name && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              </div>
            )}
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Label htmlFor="primary-color">Primary Color</Label>
          <div className="flex items-center gap-2">
            <PickColor />
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Label>Welcome Message</Label>
          </div>
          <div className="relative">
            <Textarea
              className="w-full sm:w-[300px] min-h-[80px]"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              onBlur={handleInitialMessageBlur}
              placeholder="Add initial message"
              disabled={updateChatbotMutation.isPending}
            />
            {updateChatbotMutation.isPending &&
              initialMessage !== chatbot?.initialMessage && (
                <div className="absolute right-2 top-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                </div>
              )}
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Label>Message suggestions</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="bg-white shadow-sm">
                  <p className="text-black">
                    Display quick reply suggestions for users to help them start
                    a conversation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            {(showSuggestedInput || suggestedMessages.length > 0) &&
              suggestedMessages.map((message, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className=""
                    value={message}
                    onChange={(e) =>
                      handleSuggestedMessageChange(index, e.target.value)
                    }
                    onBlur={handleSuggestedMessageBlur}
                    placeholder={`Suggested message ${index + 1}`}
                    disabled={updateChatbotMutation.isPending}
                  />
                  <Button
                    variant="outline"
                    onClick={() => removeSuggestedMessage(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              onClick={addSuggestedMessage}
              className="w-full sm:w-fit"
            >
              <Plus className="h-4 w-4" />
              Add a message suggestion
            </Button>
          </div>
        </div>
        <Separator className="my-6" />
        <WidgetSettings />
        <Separator className="my-6" />{" "}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="hide-powered-by">Hide "Powered by" text</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="bg-white shadow-sm">
                  <p className="text-black">
                    Remove the "Powered by" text from your chatbot
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="hide-powered-by"
              checked={hidePoweredBy}
              onCheckedChange={handleHidePoweredByChange}
              disabled={updateChatbotMutation.isPending}
              className="data-[state=checked]:bg-green-500"

            />
            {updateChatbotMutation.isPending &&
              hidePoweredBy !== chatbot?.hidePoweredBy && (
                <Spinner className="text-primary" />
              )}
          </div>
        </div>
      </div>
      <div className="h-[16px]" />

      {/* Add-ons Dialog */}
      <Dialog open={addonsDialogOpen} onOpenChange={setAddonsDialogOpen}>
        <AddOnsDialog
          defaultValue="branding"
          onOpenChange={setAddonsDialogOpen}
        />
      </Dialog>
    </div>
  );
}
