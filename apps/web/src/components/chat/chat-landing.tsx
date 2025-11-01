import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { IssueReportForm } from "@/lib/ai/tools-ui/issue-report-form";
import { RiBardFill } from "@remixicon/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface ChatLandingProps {
  onGoToMain: () => void;
  onCloseWidget?: () => void;
  chatbot?: {
    image?: string | null;
    name?: string | null;
    primaryColor?: string | null;
  };
  className?: string;
  children?: ReactNode;
}

export function ChatLanding({ onGoToMain, onCloseWidget, chatbot, className }: ChatLandingProps) {
  const { primaryColor, image } = chatbot || {};
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showIssueReportForm, setShowIssueReportForm] = useState(false);

  if (showFeedbackForm) {
    return (
      <div className={`flex system-font flex-col bg-slate-25 w-full h-full ${className}`}>
        <ScrollArea className="w-full h-full">
          <div
            style={{ backgroundColor: primaryColor || "inherit" }}
            className="w-full flex items-center gap-2 px-2 py-4 border-b "
          >
            <Button
              size="icon"
              onClick={() => setShowFeedbackForm(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
              variant="ghost"
            >
              <ArrowLeft className="text-white" size={16} />
            </Button>
            <h2 className="text-base font-semibold text-white">Send us feedback</h2>
          </div>
          <div className="p-6">
            <CollectFeedbackForm color={primaryColor || undefined} />
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (showIssueReportForm) {
    return (
      <div className={`system-font flex flex-col bg-slate-25 w-full h-full ${className}`}>
        <ScrollArea className="w-full h-full">
          <div
            style={{ backgroundColor: primaryColor || "inherit" }}
            className="w-full flex items-center gap-2 px-2 py-4 border-b "
          >
            <Button
              size="icon"
              onClick={() => setShowIssueReportForm(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
              variant="ghost"
            >
              <ArrowLeft className="text-white" size={16} />
            </Button>
            <h2 className="text-base font-semibold text-white">Report an Issue</h2>
          </div>
          <div className="p-6">
            <IssueReportForm color={primaryColor || undefined} />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-25 w-full h-full system-font ${className}`}>
      <ScrollArea className="w-full h-full">
        <div
          className="w-full flex flex-col gap-8 p-6 h-[230px] border-b dark:shadow-none"
          style={{
            background: primaryColor
              ? `linear-gradient(to bottom left, ${primaryColor}, ${primaryColor}80)`
              : undefined,
          }}
        >
          <div className="flex gap-2 w-full items-center">
            <Avatar className="w-12 h-12 shadow-sm border-2 border-white">
              <AvatarImage src={image || undefined} alt="Assistant" />
              <AvatarFallback>
                <RiBardFill className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1" />
            {/* Close widget button */}
            {onCloseWidget && (
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close widget"
                onClick={onCloseWidget}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Button>
            )}
          </div>
          <div className="text-2xl leading-normal block text-white">
            <p className="wrap-break-word font-semibold">Hey there 👋</p>
            <p className="wrap-break-word font-semibold">How can we help?</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div
            className="shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={onGoToMain}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Start a conversation
              </span>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="w-6 h-6 rounded flex items-center justify-center"
            >
              <ChevronRight
                style={{ color: primaryColor || "inherit" }}
                className="w-3 h-3"
              />
            </Button>
          </div>
          <div
            className="shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => setShowFeedbackForm(true)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Give us feedback
              </span>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="w-6 h-6 rounded flex items-center justify-center"
            >
              <ChevronRight
                style={{ color: primaryColor || "inherit" }}
                className="w-3 h-3"
              />
            </Button>
          </div>
          <div
            className="shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => setShowIssueReportForm(true)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                Report an issue
              </span>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="w-6 h-6 rounded flex items-center justify-center"
            >
              <ChevronRight
                style={{ color: primaryColor || "inherit" }}
                className="w-3 h-3"
              />
            </Button>
          </div>

        </div>
      </ScrollArea>
      <div className="flex system-font bg-gray-50 border-t p-3 items-center justify-center text-xs text-muted-foreground">
        <span>Powered by </span>
        <a
          href="https://padyna.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: chatbot?.primaryColor || "#2563eb" }}
          className="ml-1 hover:underline font-semibold"
        >
          Padyna
        </a>
      </div>
    </div>
  );
}