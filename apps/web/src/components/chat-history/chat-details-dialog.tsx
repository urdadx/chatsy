import { osCodes } from "@/constants/os"
import { getChatById } from "@/lib/server-functions/chat-queries"
import type { ChatData, ChatMetaData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { HelpCircle, Info, Monitor, Smartphone, Tablet } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

export const ChatDetailsDialog = ({ chatId }: { chatId?: string }) => {
  const { data: chat, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChatById({ data: chatId || "" }),
    enabled: !!chatId,
  })

  const metadata = (chat as ChatData)?.chatMetaData as ChatMetaData | undefined

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Info color="#915bf5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Chat details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : chat ? (
          <div className="space-y-4 py-4">
            <div className="grid gap-3 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">Date created</span>
                <span className="text-sm">{format(new Date((chat as ChatData).createdAt), "PPpp")}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">Status</span>

                <span
                  className={cn(
                    "px-2 py-1 rounded-xl text-xs capitalize flex items-center gap-1",
                    (chat as ChatData).status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : (chat as ChatData).status === "unresolved"
                        ? "bg-blue-100 text-blue-800"
                        : (chat as ChatData).status === "escalated"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800",
                  )}
                >
                  {(chat as ChatData).status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">Channel</span>
                <span className="text-sm capitalize">{(chat as ChatData).channel}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">Visibility</span>
                <span className="text-sm capitalize">{(chat as ChatData).visibility}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">Assigned to</span>
                <span className="text-sm">
                  {(chat as ChatData).assignedUser?.name || (chat as ChatData).assignedUser?.email || "Not assigned"}
                </span>
              </div>

              {metadata && (
                <>
                  {(metadata.country || metadata.city) && (
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-muted-foreground">Location</span>
                      <span className="text-sm">
                        {[metadata.city, metadata.country].filter(Boolean).join(", ") || "Unknown"}
                      </span>
                    </div>
                  )}

                  {metadata.timezone && (
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-muted-foreground">Timezone</span>
                      <span className="text-sm">{metadata.timezone}</span>
                    </div>
                  )}

                  {metadata.device && (
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-muted-foreground">Device information</span>
                      <div className="flex gap-2">
                        {metadata.device.type === "mobile" ? (
                          <Smartphone className="w-4 h-4" />
                        ) : metadata.device.type === "tablet" ? (
                          <Tablet className="w-4 h-4" />
                        ) : metadata.device.type === "desktop" ? (
                          <Monitor className="w-4 h-4" />
                        ) : (
                          <HelpCircle className="w-4 h-4" />
                        )}
                        {metadata.device.os !== "unknown" && (
                          <img
                            src={`/public/os/${osCodes[metadata.device.os as keyof typeof osCodes] || metadata.device.os.toUpperCase()}.png`}
                            alt={metadata.device.os}
                            className="w-4 h-4"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        {metadata.device.browser !== "unknown" && (
                          <img
                            src={`/public/browser/${metadata.device.browser.toLowerCase()}.png`}
                            alt={metadata.device.browser}
                            className="w-4 h-4"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {metadata.device?.model && (
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-muted-foreground">Model</span>
                      <span className="text-sm">{metadata.device.model}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">Chat not found</div>
        )}
      </DialogContent>
    </Dialog>
  )
}