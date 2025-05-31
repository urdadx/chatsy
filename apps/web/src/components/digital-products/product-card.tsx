import { EllipsisVertical } from "lucide-react";
import { Button } from "../ui/button";

export const ProductCard = () => {
  return (
    <div className="w-full group  bg-white rounded-2xl border-2 border-purple-100 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden relative">
      <div className="w-full h-32 overflow-hidden">
        <img
          src="https://m.media-amazon.com/images/I/81bsw6fnUiL._SL1500_.jpg"
          alt="Product thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 p-1"
        >
          <EllipsisVertical size={20} className="text-gray-600" />
        </Button>

        <h3 className="text-md font-medium text-black mb-3 pr-8">
          product name
        </h3>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            courses
          </span>
        </div>
      </div>
    </div>
  );
};
