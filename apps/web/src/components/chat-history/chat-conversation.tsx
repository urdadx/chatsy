import { ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";

export const ChatConversation = () => {
  return (
    <div className=" p-4 ">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-end">
          <div className="bg-gray-50 text-black px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">
              Hey, I would like to check if my payment went through for my order
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">Ok, what's your order number?</p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-gray-50 text-black px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">Its #313A-DAD placed on 12th Nov.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            className="text-sm text-green-600 border-green-200 hover:bg-green-50 hover:text-green-800"
          >
            Get product info
            <ShoppingBag className="h-4 w-4 " />
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="bg-purple-600 text-white border px-4 py-2 rounded-lg max-w-md">
            <p className="text-sm  mb-3">
              We can see that your payment went through, you should receive an
              email confirmation for the same shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
