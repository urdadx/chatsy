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
import {
  Copy,
  ExternalLink,
  InfoIcon,
  Plus,
  RefreshCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function EmbeddingSettings() {
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

  const copyEmbedCode = () => {
    if (!embedToken) return;

    const embedCode = `<!-- Chatsy Embedded Widget -->
<div id="chatsy-widget"></div>
<script>
  (function() {
    const script = document.createElement('script');
    script.src = '${window.location.origin}/embed.js';
    script.async = true;
    script.onload = function() {
      ChatsyWidget.init({
        embedToken: '${embedToken}',
        containerId: 'chatsy-widget'
      });
    };
    document.head.appendChild(script);
  })();
</script>`;

    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  const copyWidgetUrl = () => {
    if (!embedToken) return;

    const widgetUrl = `${window.location.origin}/embed/${embedToken}`;
    navigator.clipboard.writeText(widgetUrl);
    toast.success("Widget URL copied to clipboard!");
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
            <Label htmlFor="enable-embedding">Enable Widget Embedding</Label>
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
                        Domains where your widget can be embedded. Leave empty
                        to allow all domains.
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
                      <X className="h-4 w-4 text-red-500" />
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
                    disabled={
                      !newDomain.trim() || updateChatbotMutation.isPending
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {embedToken && (
              <>
                <Separator className="my-6" />

                {/* Integration Code */}
                <div className="flex flex-col gap-3">
                  <Label>Integration</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={copyEmbedCode}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Embed Code
                      </Button>
                      <Button
                        variant="outline"
                        onClick={copyWidgetUrl}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Copy Widget URL
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>
                        Add the embed code to your website's HTML, or use the
                        widget URL for iframe embedding.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
