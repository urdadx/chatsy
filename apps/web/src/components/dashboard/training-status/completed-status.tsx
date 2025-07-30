import { RiCheckboxCircleFill } from "@remixicon/react";
import { Hammer } from "lucide-react";
import { Button } from "../../ui/button";

export const CompletedStatus = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-gray-800">Training status</p>

      <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-xs">
        <div className="flex items-start gap-3">
          <RiCheckboxCircleFill className="h-6 w-6 text-green-600 mt-0.5" />
          <div>
            <p className="text-base font-medium text-green-700">
              Your chatbot is ready!
            </p>
            <p className="text-sm text-green-600 mt-1 leading-relaxed max-w-2xl">
              All the data you provided has been processed, and your chatbot is
              now ready to answer questions. You can test it in the playground
              or add more training data to improve performance.
            </p>
            <Button
              variant="outline"
              className="mt-2 border-green-500 text-green-700 hover:text-green-800 hover:border-green-600"
            >
              <Hammer className="w-4 h-4 " />
              Test in Playground
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
