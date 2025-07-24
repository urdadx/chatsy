import { Button } from "@/components/ui/button";
import { RiCheckboxCircleFill } from "@remixicon/react";

export const InProgressStatus = () => {
  return (
    <>
      <div className="flex flex-col space-y-5">
        <p className="text-md font-semibold">Training status</p>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-700">
            <RiCheckboxCircleFill className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-md">Training in progress</p>
          </div>
          <p className="text-sm text-yellow-600 max-w-2xl line-clamp-2 leading-relaxed mt-2 ml-7">
            Your chatbot is currently being trained with the provided data. This
            process may take some time depending on the amount of data and the
            complexity of the training.
          </p>
          <Button
            className="ml-7 text-yellow-600 mt-2 border border-yellow-400"
            variant="outline"
          >
            <span className="text-yellow-600 hover:text-yellow-500">
              See progress
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};
