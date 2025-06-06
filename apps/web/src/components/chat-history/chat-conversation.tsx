import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const ChatConversation = () => {
  return (
    <div className=" p-4 ">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">
              Hey, I would like to check if my payment went through for my order
            </p>
            <div className="flex items-center justify-end mt-2">
              <Badge
                variant="secondary"
                className="text-xs bg-gray-700 text-gray-300"
              >
                2 AI requests
              </Badge>
            </div>
          </div>
        </div>

        {/* Bot Response */}
        <div className="flex justify-start">
          <div className="bg-white border px-4 py-2 rounded-lg max-w-xs shadow-sm">
            <p className="text-sm text-gray-800">
              Sure, what's your order number?
            </p>
          </div>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">#1 0412</p>
          </div>
        </div>

        {/* Bot Response */}
        <div className="flex justify-start">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">Its #313A-DAD placed on 12th Nov.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            className="text-sm text-green-600 border-green-200 hover:bg-green-50"
          >
            <span className="mr-2">✓</span>
            Get product info
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Final Bot Response */}
        <div className="flex justify-start">
          <div className="bg-white border px-4 py-2 rounded-lg max-w-md shadow-sm">
            <p className="text-sm text-gray-800 mb-3">
              We can see that your payment went through, you should receive an
              email confirmation for the same shortly.
            </p>
            <div className="flex space-x-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                👍
              </Badge>
              <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                #1 0.00%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
