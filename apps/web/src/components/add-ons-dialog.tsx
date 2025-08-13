import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ArrowRight, Bot, MessageCircle, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DialogContent } from "./ui/dialog";

export const AddOnsDialog = ({ defaultValue }: { defaultValue: string }) => {
  const { data: session } = useSession();
  const [selectedAddon, setSelectedAddon] = useState<string | null>(
    defaultValue,
  );

  const handleCheckout = async () => {
    const organizationId = session?.session?.activeOrganizationId;

    if (!organizationId) {
      console.error("No active organization found. Nothing to reference");
      return;
    }

    await authClient.checkout({
      slug: "starter",
      referenceId: organizationId,
    });
  };

  const selectAddon = (addonId: string) => {
    setSelectedAddon((prev) => (prev === addonId ? null : addonId));
  };

  const isSelected = (addonId: string) => selectedAddon === addonId;

  return (
    <DialogContent className=" w-full max-w-lg">
      <div className="space-y-1">
        <DialogTitle className="text-lg font-semibold">Add-ons</DialogTitle>
        <p className="text-sm text-gray-600">Get more with add-ons</p>
      </div>

      {/* Extra 5k Messages Addon */}
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("messages")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("messages")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra 1000 messages</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$10
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Remove Padyna Branding Addon  */}
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("branding")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("branding")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
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
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra chabot */}
      <Card
        className={cn(
          "shadow-xs cursor-pointer transition-colors",
          isSelected("chatbot")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("chatbot")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra AI chatbot</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$7
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={!selectedAddon}
        >
          Proceed to checkout
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </DialogContent>
  );
};
