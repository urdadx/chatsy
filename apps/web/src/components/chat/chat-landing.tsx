import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CollectFeedbackForm } from "@/lib/ai/tools-ui/collect-feedback-form";
import { RiSendPlane2Fill } from "@remixicon/react";
import { ArrowLeft, ChevronRight, Sparkles, } from "lucide-react"
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface ChatLandingProps {
  onGoToMain: () => void;
  chatbot?: {
    image?: string | null;
    name?: string | null;
    primaryColor?: string | null;
  };
  className?: string;
  children?: ReactNode;
}

export function ChatLanding({
  onGoToMain,
  chatbot,
  className,
}: ChatLandingProps) {

  const { primaryColor, image } = chatbot || {};
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  if (showFeedbackForm) {
    return (
      <div className={`flex flex-col bg-slate-25 w-full h-full ${className}`}>
        <ScrollArea className="w-full h-full">
          <div style={{
            backgroundColor: primaryColor || "inherit"
          }} className="w-full flex items-center gap-2 px-2 py-4 border-b ">

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
          <div className="p-4">
            <CollectFeedbackForm color={primaryColor || undefined} />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-slate-25 w-full h-full  ${className}`}
    >
      <ScrollArea className="w-full h-full">
        {/* Bot Avatar/Icon */}
        <div className="w-full flex flex-col gap-6 p-4 h-[200px] border-b dark:shadow-none" style={{
          background: primaryColor ? `linear-gradient(to bottom left, ${primaryColor}, ${primaryColor}80)` : undefined
        }}>
          <div className="flex gap-2 w-full ">
            <Avatar className="w-12 h-12 shadow-sm border-2 border-white">
              <AvatarImage src={image || undefined} alt="Assistant" />
              <AvatarFallback>
                <Sparkles className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-2xl leading-normal block text-white">
            <p className="wrap-break-word font-semibold">
              Hi there 👋
            </p>
            <p className="wrap-break-word font-semibold">How can we help?</p>
          </div>

        </div>
        <div onClick={onGoToMain} className="mx-4 mt-4 rounded-lg border shadow-sm hover:bg-gray-50 cursor-pointer bg-white">
          <div className=" p-3 ">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-gray-900 text-sm font-semibold">Send us a message</span>
                <span className="text-gray-500 text-sm">We are here to help you!</span>
              </div>
              <Button variant="ghost"  >
                <RiSendPlane2Fill style={{
                  color: primaryColor || 'inherit',
                  width: 20,
                  height: 20,
                }}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Actions*/}
        <div className="p-4 pt-6">
          <h1 className="text-sm font-semibold text-gray-900">Quick Actions</h1>
        </div>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <div
            className="border shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
            onClick={() => setShowFeedbackForm(true)}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">Give us feedback</span>
            </div>
            <Button size="icon" variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
              <ChevronRight style={{
                color: primaryColor || 'inherit',
              }} className="w-3 h-3" />
            </Button>
          </div>
          <div className="border shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm">Book a meeting</span>
            </div>
            <Button size="icon" variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
              <ChevronRight style={{
                color: primaryColor || 'inherit',
              }} className="w-3 h-3" />
            </Button>
          </div>
          <div className="border shadow-sm bg-white rounded-md w-full p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm">Report an issue</span>
            </div>
            <Button size="icon" variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
              <ChevronRight style={{
                color: primaryColor || 'inherit',
              }} className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}