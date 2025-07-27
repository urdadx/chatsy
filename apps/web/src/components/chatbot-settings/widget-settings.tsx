import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatbot, useUpdateChatbot } from "@/hooks/use-chatbot";
import { InfoIcon, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WidgetSettings() {
  const { data: chatbot, error, refetch } = useChatbot();
  const updateChatbotMutation = useUpdateChatbot();

  const [isEmbeddingEnabled, setIsEmbeddingEnabled] = useState(false);
  const [embedToken, setEmbedToken] = useState("");
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    if (chatbot) {
      setIsEmbeddingEnabled(chatbot.isEmbeddingEnabled || false);
      setEmbedToken(chatbot.embedToken || "");
      setAllowedDomains(chatbot.allowedDomains || []);
    }
  }, [chatbot]);

  const generateEmbedToken = () => {
    const token = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setEmbedToken(token);
    updateChatbot({ embedToken: token });
  };

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
      console.error("Error updating chatbot:", error);
    }
  };

  const handleEmbeddingToggle = (checked: boolean) => {
    setIsEmbeddingEnabled(checked);
    updateChatbot({ isEmbeddingEnabled: checked });

    // Generate token if enabling for the first time
    if (checked && !embedToken) {
      generateEmbedToken();
    }
  };

  const addDomain = () => {
    if (newDomain.trim() && !allowedDomains.includes(newDomain.trim())) {
      const updatedDomains = [...allowedDomains, newDomain.trim()];
      setAllowedDomains(updatedDomains);
      updateChatbot({ allowedDomains: updatedDomains });
      setNewDomain("");
    }
  };

  const removeDomain = (index: number) => {
    const updatedDomains = allowedDomains.filter((_, i) => i !== index);
    setAllowedDomains(updatedDomains);
    updateChatbot({ allowedDomains: updatedDomains });
  };

  if (error) {
    return (
      <div className="w-full mx-auto px-2 sm:px-0">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-red-50 p-3">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              Unable to load embedding settings
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
        {/* Enable Embedding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="enable-embedding">Activate Widget </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="bg-white shadow-sm">
                  <p className="text-black">
                    Allow your chatbot to be embedded on external websites
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="enable-embedding"
              checked={isEmbeddingEnabled}
              onCheckedChange={handleEmbeddingToggle}
              disabled={updateChatbotMutation.isPending}
            />
            {updateChatbotMutation.isPending && (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Allowed Domains */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Label>Allowed Domains</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="bg-white shadow-sm">
                  <p className="text-black">
                    Domains where your widget can be embedded. Leave empty to
                    allow all domains.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            {allowedDomains.map((domain, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input className="flex-1" value={domain} readOnly />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDomain(index)}
                  disabled={updateChatbotMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addDomain()}
              />
              <Button
                variant="outline"
                onClick={addDomain}
                disabled={!newDomain.trim() || updateChatbotMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {isEmbeddingEnabled && (
          <>
            <Separator className="my-6" />

            {/* Embed Token */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex items-center gap-2">
                <Label>Embed Token</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-sm">
                      <p className="text-black">
                        Unique token used to access your chatbot publicly
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="w-[300px] font-mono text-sm"
                  value={embedToken}
                  readOnly
                  placeholder="Generate a token first"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateEmbedToken}
                  disabled={updateChatbotMutation.isPending}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
