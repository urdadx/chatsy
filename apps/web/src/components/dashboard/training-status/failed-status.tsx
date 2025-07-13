import { Button } from "@/components/ui/button";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { RotateCcw } from "lucide-react";

export const FailedStatus = () => {
  return (
    <>
      <div className="flex flex-col space-y-5">
        <p className="text-md font-semibold">Training status</p>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <RiCheckboxCircleFill className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-md">Traing failed</p>
          </div>
          <p className="text-sm text-red-600 max-w-2xl line-clamp-2 leading-relaxed mt-2 ml-7">
            There was an error during the training process. Please check the
            provided data and try again. If the issue persists, contact support
            for assistance.
          </p>
          <Button
            className="ml-7 text-red-600 mt-2 border border-red-400"
            variant="outline"
          >
            <RotateCcw className="text-red-600 hover:text-red-600" />
            <span className="text-red-600 hover:text-red-500">Try again</span>
          </Button>
        </div>
      </div>
    </>
  );
};
