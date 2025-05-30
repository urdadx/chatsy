import { Button } from "@/components/ui/button";
import {
  RiInstagramFill,
  RiMessengerFill,
  RiWhatsappFill,
} from "@remixicon/react";
import { SearchQuestions } from "../search-questions";
import { AddIntegrations } from "./add-sources";

export const BotIntegrations = () => {
  return (
    <>
      <div className="w-full flex flex-col mt-5 gap-5">
        <div className="flex justify-between items-center w-full gap-3">
          <SearchQuestions />
          <AddIntegrations />
        </div>
        <div className="w-full py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className=" flex flex-col h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <RiWhatsappFill className="w-5 h-5 text-green-400" />
              WhatsApp
            </div>
            <span className="text-sm text-muted-foreground">
              Connect your bot to Instagram
            </span>
            <Button
              className="mt-2 h-9 w-fit text-green-800 border border-green-400 hover:text-green-500 shadow-none bg-green-50 hover:bg-green-50"
              variant="outline"
            >
              Connect
            </Button>
          </div>
          <div className=" flex flex-col h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <RiInstagramFill className="w-5 h-5 text-rose-400" />
              Instagram
            </div>
            <span className="text-sm text-muted-foreground">
              Connect your bot to Instagram
            </span>
            <Button
              className="mt-2 w-fit h-9 text-green-800 border border-green-400 hover:text-green-500 shadow-none bg-green-50 hover:bg-green-50"
              variant="outline"
            >
              Connect
            </Button>
          </div>
          <div className=" flex flex-col h-fit rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-visible p-4 space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <RiMessengerFill className="w-5 h-5 text-blue-400" />
              Facebook Messenger
            </div>
            <span className="text-sm text-muted-foreground">
              Connect your bot to Instagram
            </span>
            <Button
              className="mt-2 h-9 w-fit text-green-800 border border-green-400 hover:text-green-500 shadow-none bg-green-50 hover:bg-green-50"
              variant="outline"
            >
              Connect
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
