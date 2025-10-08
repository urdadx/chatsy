import { SolarPlain2BoldDuotone } from "@/assets/icons/plane-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ActionType } from "@/db/schema";
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { IssueReportForm } from "@/lib/ai/tools-ui/issue-report-form";
import { RiBardFill } from "@remixicon/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { QuickMenuSkeleton } from "../agents/quick-action-skeleton";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface ChatLandingProps {
  onGoToMain: () => void;
  chatbot?: {
    image?: string | null;
    name?: string | null;
    primaryColor?: string | null;
    actions?: ActionType[];
  };
  className?: string;
  children?: ReactNode;
}

export function ChatLanding({ onGoToMain, chatbot, className }: ChatLandingProps) {
  const { primaryColor, image, actions } = chatbot || {};
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showIssueReportForm, setShowIssueReportForm] = useState(false);

  void showIssueReportForm;

  const quickMenuActions = useMemo(
    () =>
      (actions || []).filter(
        (action) =>
          action.showInQuickMenu &&
          action.isActive &&
          !["knowledge_base", "collect_leads", "escalate_to_human"].includes(action.toolName || "")
      ),
    [actions]
  );

  const handleActionClick = (action: ActionType) => {
    if (action.toolName === "collect_feedback") {
      setShowFeedbackForm(true);
    } else if (action.toolName === "report_issue") {
      setShowIssueReportForm(true);
    } else if (action.toolName === "book_meeting") {
      console.log("Book meeting action clicked");
    } else if (action.toolName === "custom_button") {
      // Handle custom button clicks
      const properties = action.actionProperties as { buttonText: string; buttonUrl: string } | null;
      if (properties && properties.buttonUrl) {
        window.open(properties.buttonUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

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
          className="w-full flex flex-col gap-6 p-4 h-[200px] border-b dark:shadow-none"
          style={{
            background: primaryColor
              ? `linear-gradient(to bottom left, ${primaryColor}, ${primaryColor}80)`
              : undefined,
          }}
        >
          <div className="flex gap-2 w-full ">
            <Avatar className="w-12 h-12 shadow-sm border-2 border-white">
              <AvatarImage src={image || undefined} alt="Assistant" />
              <AvatarFallback>
                <RiBardFill className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-2xl leading-normal block text-white">
            <p className="wrap-break-word font-semibold">Hi there 👋</p>
            <p className="wrap-break-word font-semibold">How can we help?</p>
          </div>
        </div>
        <div
          onClick={onGoToMain}
          className="mx-4 mt-4 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer bg-white"
        >
          <div className="p-3">
            <div className="pl-2 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-gray-700 text-sm font-semibold">Send us a message</span>
                <span className="text-gray-500 text-sm">We are here to help you!</span>
              </div>
              <Button variant="ghost">
                <SolarPlain2BoldDuotone
                  color={primaryColor || ""}
                  style={{ width: 25, height: 25 }}
                />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 pt-4">
          <h1 className="text-sm font-semibold text-gray-00">Quick Actions</h1>
        </div>
        <div className="flex flex-col gap-2 px-4 pb-2">
          {chatbot ? (
            quickMenuActions.length > 0 ? (
              quickMenuActions.map((action) => (
                <div
                  key={action.id}
                  className="shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => handleActionClick(action)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{action.name}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    <ChevronRight
                      style={{ color: primaryColor || "inherit" }}
                      className="w-3 h-3"
                    />
                  </Button>
                </div>
              ))
            ) : (
              <QuickMenuSkeleton />
            )
          ) : (
            <QuickMenuSkeleton />
          )}
        </div>
      </ScrollArea>
      <div className="flex system-font my-3 items-center justify-center text-xs text-muted-foreground">
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