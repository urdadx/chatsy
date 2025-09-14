import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiBardFill } from "@remixicon/react";
import { RefreshCcw, RotateCcw, X } from "lucide-react";
import type { ReactNode } from "react";

interface ChatHeaderProps {
  chatbot?: {
    image?: string | null;
    name?: string | null;
    primaryColor?: string | null;
  };
  onReset?: () => void;
  onClose?: () => void;
  showResetButton?: boolean;
  showCloseButton?: boolean;
  resetIcon?: "refresh" | "rotate";
  className?: string;
  children?: ReactNode;
}

export function ChatHeader({
  chatbot,
  onReset,
  onClose,
  showResetButton = true,
  showCloseButton = false,
  resetIcon = "refresh",
  className,
  children,
}: ChatHeaderProps) {
  const ResetIcon = resetIcon === "refresh" ? RefreshCcw : RotateCcw;

  return (
    <div
      className={`flex items-center justify-between p-4 text-white border-b ${className}`}
      style={{ backgroundColor: chatbot?.primaryColor || "#2563eb" }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {chatbot?.image ? (
          <img
            src={chatbot.image}
            alt="Assistant"
            className="rounded-full w-8 h-8 flex-shrink-0"
          />
        ) : (
          <div className="rounded-full w-9 h-9 flex items-center justify-center">
            <RiBardFill size={20} className="text-white rounded-full" />
          </div>
        )}
        <p className="font-normal text-base truncate">
          {chatbot?.name || "AI Assistant"}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {children}

        {showResetButton && onReset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={onReset}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Reset chat"
                variant="ghost"
              >
                <ResetIcon className="text-white" size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white shadow-sm" side="top">
              <p className="text-black">Reset chat</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showCloseButton && onClose && (
          <Button
            size="icon"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close chat"
            variant="ghost"
          >
            <X className="text-white" size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
