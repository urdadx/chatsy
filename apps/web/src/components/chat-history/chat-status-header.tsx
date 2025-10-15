import { Button } from "../ui/button";
import Spinner from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error" | "idle";

interface ChatStatusHeaderProps {
  status: ConnectionStatus;
  hasJoined: boolean;
  isConnected: boolean;
  onConnect: () => void;
  onJoin?: () => void;
  onEndSession?: () => void;
  isAssignedToOther?: boolean;
  assignedUserName?: string;
}

export const ChatStatusHeader = ({
  status,
  hasJoined,
  isConnected,
  onConnect,
  onJoin,
  onEndSession,
  isAssignedToOther = false,
  assignedUserName = "Another agent",
}: ChatStatusHeaderProps) => {
  const getBackgroundColor = () => {
    if (status === "connected" && hasJoined) {
      return "bg-green-50 dark:bg-green-950";
    } if (status === "connecting") {
      return "bg-blue-50 dark:bg-blue-950";
    } if (status === "disconnected" || status === "error") {
      return "bg-yellow-50 dark:bg-yellow-950";
    }
    return "bg-gray-50 dark:bg-gray-950";
  };



  const handleRetryConnection = () => {
    onConnect();
    if (onJoin) {
      onJoin();
    }
  };

  return (
    <div className={`border-b flex items-center justify-between px-4 py-2 ${getBackgroundColor()}`}>
      <div className="flex items-center gap-2 text-sm">
        {status === "connected" && hasJoined ? (
          <>
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-green-700 dark:text-green-300">
              You are now live with the user
            </span>
          </>
        ) : status === "connecting" ? (
          <>
            <Spinner className="size-3" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Establishing connection...
            </span>
          </>
        ) : status === "disconnected" ? (
          <>
            <div className="size-2 rounded-full bg-yellow-500" />
            <span className="font-medium text-yellow-700 dark:text-yellow-300">
              You are not connected.
            </span>
          </>
        ) : status === "error" ? (
          <>
            <div className="size-2 rounded-full bg-yellow-500" />
            <span className="font-medium text-yellow-700 dark:text-yellow-300">
              Couldn't connect. The user likely left the chat.
            </span>
          </>
        ) : (
          <>
            <div className="size-2 rounded-full bg-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Ready to connect
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {(status === "disconnected" || status === "error") && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRetryConnection}
                variant="outline"
                size="sm"
                className="text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-300 dark:hover:text-yellow-300 dark:hover:bg-yellow-950"
                disabled={isAssignedToOther}
              >
                {status === "error" ? "Try again" : "Join chat"}
              </Button>
            </TooltipTrigger>
            {isAssignedToOther && (
              <TooltipContent>
                {assignedUserName} has been assigned to this chat. You can't engage.
              </TooltipContent>
            )}
          </Tooltip>
        )}
        {hasJoined && isConnected && onEndSession && (
          <Button
            onClick={onEndSession}
            className="text-green-700 hover:text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:text-green-300 dark:hover:bg-green-950"
            variant="outline"
            size="sm"
          >
            End session
          </Button>
        )}
      </div>
    </div>
  );
};
