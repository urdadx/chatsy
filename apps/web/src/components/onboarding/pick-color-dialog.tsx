import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function ColorPickerDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <button
          type="button"
          className="w-8 h-8 cursor-pointer rounded-full flex items-center border-2 border-dashed border-gray-500 justify-center transition-all duration-200 hover:bg-gray-100 hover:scale-105"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Select a color
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
