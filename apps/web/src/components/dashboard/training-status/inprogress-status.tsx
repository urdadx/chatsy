import { Button } from "@/components/ui/button";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { Eye } from "lucide-react";

export const InProgressStatus = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-gray-800">Training status</p>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-xs">
        <div className="flex items-start gap-3">
          <RiCheckboxCircleFill className="h-6 w-6 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-base font-medium text-yellow-700">
              Training in progress
            </p>
            <p className="text-sm text-yellow-600 mt-1 leading-relaxed max-w-2xl">
              Your chatbot is currently being trained with the provided data.
              This process may take some time depending on the amount of data
              and the complexity of the training.
            </p>
            <Button
              variant="outline"
              className="mt-2 border-yellow-500 text-yellow-700 hover:text-yellow-800 hover:border-yellow-600"
            >
              <Eye className="w-4 h-4" />
              See progress
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
