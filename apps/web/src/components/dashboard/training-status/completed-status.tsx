import { RiCheckboxCircleFill } from "@remixicon/react";
import { Hammer } from "lucide-react";
import { Button } from "../../ui/button";

export const CompletedStatus = () => {
  return (
    <>
      <div className="flex flex-col space-y-5">
        <p className="text-md font-semibold">Training status</p>

        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-700">
            <RiCheckboxCircleFill className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-md">Your chatbot is ready!</p>
          </div>
          <p className="text-sm text-green-600 max-w-2xl line-clamp-2 leading-relaxed mt-2 ml-7">
            All the data provided have been processed and your chatbot is ready
            to answer questions. You can add more data for training or test the
            bot in playground
          </p>
          <Button
            className="ml-7 text-green-600 mt-2 border border-green-400"
            variant="outline"
          >
            <Hammer className="text-green-600 hover:text-green-600" />
            <span className="text-green-600 hover:text-green-500">
              Test in playground
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};
