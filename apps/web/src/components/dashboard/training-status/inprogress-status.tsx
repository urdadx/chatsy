import { Button } from "@/components/ui/button";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { Eye } from "lucide-react";

export const InProgressStatus = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-gray-800">Training status</p>

      <div className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-gradient-to-bl from-yellow-50 via-yellow-25 to-background p-2.5 shadow-xs transition-transform hover:scale-[1.02] dark:shadow-none dark:from-yellow-950/20 dark:via-yellow-900/10">
        <div className="flex items-start gap-3 p-1.5">
          <div>
            <p className="text-base flex items-center gap-2 font-medium text-yellow-700">
              <RiCheckboxCircleFill className="h-6 w-6 text-yellow-600 mt-0.5" />
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
