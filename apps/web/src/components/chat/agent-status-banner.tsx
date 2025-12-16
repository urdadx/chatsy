import { X } from "lucide-react";
import { Button } from "../ui/button";

type AgentStatus = "connected" | "disconnected" | "idle" | "waiting";

interface AgentStatusBannerProps {
  status: AgentStatus;
  onDismiss?: () => void;
}

export const AgentStatusBanner = ({
  status,
  onDismiss,
}: AgentStatusBannerProps) => {
  if (status === "idle") {
    return null;
  }

  const isConnected = status === "connected";
  const isWaiting = status === "waiting";

  const getStatusStyles = () => {
    if (isConnected) {
      return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
    }
    if (isWaiting) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }
    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
  };

  const getIndicatorStyles = () => {
    if (isConnected) {
      return "bg-green-500 animate-pulse";
    }
    if (isWaiting) {
      return "bg-blue-500 animate-pulse";
    }
    return "bg-yellow-500";
  };

  const getDismissStyles = () => {
    if (isConnected) {
      return "hover:bg-green-100 dark:hover:bg-green-900";
    }
    if (isWaiting) {
      return "hover:bg-blue-100 dark:hover:bg-blue-900";
    }
    return "hover:bg-yellow-100 dark:hover:bg-yellow-900";
  };

  const getMessage = () => {
    if (isConnected) {
      return "Currently chatting with human agent";
    }
    if (isWaiting) {
      return "Chat escalated. Waiting for human agent";
    }
    return "Agent has left the conversation";
  };

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 text-sm ${getStatusStyles()}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`size-2 rounded-full ${getIndicatorStyles()}`}
        />
        <span className="font-medium">
          {getMessage()}
        </span>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className={`h-6 w-6 p-0 ${getDismissStyles()}`}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </div>
  );
};
