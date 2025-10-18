
import { SolarBoltBoldDuotone } from "@/assets/icons/bolt-duotone";
import { SolarChatUnreadBoldDuotone } from "@/assets/icons/chat-unread-icon";
import { SolarUserRoundedBoldDuotone } from "@/assets/icons/user-icon";
import { authClient, useSession } from "@/lib/auth-client";
import { ADDON_PRODUCT_IDS } from "@/lib/plan-slugs";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { RiRobot2Fill } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DialogContent } from "./ui/dialog";
import {
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import Spinner from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const AddOnsDialog = ({
  defaultValue,
  onOpenChange,
}: {
  defaultValue: string;
  onOpenChange?: (value: boolean) => void;
}) => {
  const { data: session } = useSession();
  const [selectedAddon, setSelectedAddon] = useState<string | null>(
    defaultValue,
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const organizationId = session?.session?.activeOrganizationId;

    if (!session) {
      toast.error("Please sign in first");
      navigate({
        to: "/login",
      });
      return;
    }

    if (!organizationId) {
      toast.error("No active organization found. Please sign in first");
      navigate({
        to: "/login",
      });
      return;
    }

    if (!selectedAddon) {
      toast.error("No addon selected");
      return;
    }

    const addonProductIdMap = ADDON_PRODUCT_IDS;
    const productId =
      addonProductIdMap[selectedAddon as keyof typeof addonProductIdMap];

    if (!productId) {
      console.error("Invalid addon selection");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Build metadata JSON
      const metadata = JSON.stringify({ referenceId: organizationId });
      const params = new URLSearchParams();
      params.append("products", productId);
      params.append("metadata", metadata);
      params.append("customerExternalId", session.user.id);
      params.append("customerEmail", session.user.email);
      params.append("customerName", session.user.name);

      const checkoutUrl = `/api/checkout?${params.toString()}`;

      await new Promise((resolve) => setTimeout(resolve, 500));

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout. Please try again.");
      setIsCheckingOut(false);
    }

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const { data: member } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  const isAdmin = member?.role === "owner" || member?.role === "admin";

  const selectAddon = (addonId: string) => {
    setSelectedAddon((prev) => (prev === addonId ? null : addonId));
  };

  const isSelected = (addonId: string) => selectedAddon === addonId;

  const addonsContent = (
    <>
      {/* Extra 5k Messages Addon */}
      <Card
        className={cn(
          "shadow-xs rounded-md cursor-pointer transition-colors",
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
                <SolarChatUnreadBoldDuotone color="#8b5cf6" className="w-6 h-6 " />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra 1000 credits</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$12
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extra chabot */}
      <Card
        className={cn(
          "shadow-xs rounded-md cursor-pointer transition-colors",
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
                <RiRobot2Fill color="#a78bfa" className="w-6 h-6 " />
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
      <Card
        className={cn(
          "shadow-xs rounded-md cursor-pointer transition-colors",
          isSelected("member")
            ? "ring-2 ring-purple-500 bg-purple-50"
            : "hover:bg-gray-50",
        )}
        onClick={() => selectAddon("member")}
      >
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <SolarUserRoundedBoldDuotone color="#8b5cf6" className="w-6 h-6 " />
              </div>
              <div>
                <h3 className="text-base text-gray-900">Extra team member</h3>
              </div>
            </div>
            <div className="">
              <div className="text-xl font-bold text-gray-900">
                +$5
                <span className="text-base font-normal text-gray-500">/mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Remove Padyna Branding Addon  */}
      <Card
        className={cn(
          "shadow-xs rounded-md cursor-pointer transition-colors",
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
                <SolarBoltBoldDuotone color="#8b5cf6" className="w-6 h-6 " />
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
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={!selectedAddon || !isAdmin || isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Spinner className="w-4 h-4 text-white" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to checkout
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        {!isAdmin && (
          <TooltipContent className="bg-white shadow-sm p-3" sideOffset={8}>
            <p className="text-black text-sm">
              Only admins can purchase add-ons. Please contact your admin
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </>
  );

  if (isDesktop) {
    return (
      <DialogContent className="w-full max-w-lg">
        <div className="space-y-1">
          <DialogTitle className="text-xl font-semibold">Add-ons</DialogTitle>
          <p className="text-base text-gray-600">Unlock more features with add-ons</p>
        </div>
        {addonsContent}
      </DialogContent>
    );
  }

  return (
    <DrawerContent>
      <DrawerHeader className="text-left">
        <DrawerTitle className="text-xl font-semibold">Add-ons</DrawerTitle>
        <p className="text-base text-gray-600">Unlock more features with add-ons</p>
      </DrawerHeader>
      <div className="px-4 space-y-4">{addonsContent}</div>
      <DrawerFooter className="pt-2">
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
};
