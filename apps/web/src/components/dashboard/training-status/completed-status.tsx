import { RiCheckboxCircleFill } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { Button } from "../../ui/button";

export const CompletedStatus = () => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-foreground font-semibold ">Training status</p>

      <div className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-gradient-to-bl from-green-50 via-green-25 to-background p-2.5 shadow-xs  dark:shadow-none dark:from-green-950/20 dark:via-green-900/10">
        <div className="flex items-start gap-3 p-1.5">
          <div>
            <p className="text-base flex gap-2 items-center font-medium text-green-700">
              <RiCheckboxCircleFill className="h-6 w-6 text-green-600 mt-0.5" />

              Your chatbot is ready!
            </p>
            <p className="text-sm text-green-600 mt-1 leading-relaxed max-w-3xl">
              All the data you provided has been processed, and your chatbot is
              now ready to answer questions. You can test it in the playground
              or add more training data to improve performance.
            </p>
            <Link to="/admin/playground">
              <Button
                variant="outline"
                className="mt-2 border-green-500 text-green-700 hover:text-green-800 hover:border-green-600"
              >
                <Hammer className="w-4 h-4 " />
                Test in Playground
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
