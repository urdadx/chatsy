import { Button } from "../ui/button";
import Spinner from "../ui/spinner";

type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error" | "idle";

interface ChatStatusHeaderProps {
  status: ConnectionStatus;
  hasJoined: boolean;
  isConnected: boolean;
  onConnect: () => void;
  onJoin?: () => void;
  onEndSession?: () => void;
}

export const ChatStatusHeader = ({
  status,
  hasJoined,
  isConnected,
  onConnect,
  onJoin,
  onEndSession,
}: ChatStatusHeaderProps) => {
  const getBackgroundColor = () => {
    if (status === "connected" && hasJoined) {
      return "bg-green-50 dark:bg-green-950";
    } if (status === "connecting") {
      return "bg-blue-50 dark:bg-blue-950";
    } if (status === "disconnected" || status === "error") {
      return "bg-red-50 dark:bg-red-950";
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
            <div className="size-2 rounded-full bg-red-500" />
            <span className="font-medium text-red-700 dark:text-red-300">
              Not connected
            </span>
          </>
        ) : status === "error" ? (
          <>
            <div className="size-2 rounded-full bg-red-500" />
            <span className="font-medium text-red-700 dark:text-red-300">
              Connection error
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
          <Button
            onClick={handleRetryConnection}
            variant="outline"
            size="sm"
            className="text-red-70 hover:text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:text-red-300 dark:hover:bg-red-950"
          >
            Join chat
          </Button>
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
