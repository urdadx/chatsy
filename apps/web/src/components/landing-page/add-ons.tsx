import { Card, CardContent } from "@/components/ui/card";
import { Bot, MessageCircle, Zap } from "lucide-react";

export function AddOns() {
  return (
    <div className="w-full max-w-xl mx-auto ">
      <div className="mb-4">
        <h1 className="text-3xl lg:text-4xl instrument-serif-regular-italic font-bold text-center text-gray-900">
          Add-ons
        </h1>
      </div>

      <div className="space-y-4">
        {/* Extra chabot */}
        <Card className="shadow-xs">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">Extra AI chatbot</h3>
                </div>
              </div>
              <div className="">
                <div className="text-xl font-bold text-gray-900">
                  +$7
                  <span className="text-base font-normal text-gray-500">
                    /mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extra 5k Messages Addon */}
        <Card className="shadow-xs">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">
                    Extra 1000 messages
                  </h3>
                </div>
              </div>
              <div className="">
                <div className="text-xl font-bold text-gray-900">
                  +$10
                  <span className="text-base font-normal text-gray-500">
                    /mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Remove Padyna Branding Addon  */}
        <Card className="shadow-xs">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">
                    Remove Padyna branding
                  </h3>
                </div>
              </div>
              <div className="">
                <div className="text-xl font-bold text-gray-900">
                  +$29
                  <span className="text-base font-normal text-gray-500">
                    /mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
