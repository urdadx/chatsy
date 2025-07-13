import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { DialogContent } from "@radix-ui/react-dialog";

interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  badgeText?: string;
}

export const ActionCard = ({
  icon,
  name,
  description,
  badgeText,
}: IntegrationCardProps) => {
  const isMobile = useIsMobile();
  return (
    <div className="bg-white rounded-md p-3 sm:p-4 border border-gray-200 shadow-sm w-full max-w-xs mx-auto h-full">
      <div className="flex flex-col gap-3 sm:gap-4 h-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium text-sm sm:text-md">{name}</h3>
          </div>
          {badgeText && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 sm:py-1 rounded-lg font-medium">
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-xs sm:text-sm flex-grow">
          {description}
        </p>
        {!isMobile ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="mt-1 sm:mt-2 w-full rounded-lg transition-colors text-sm"
              >
                See details
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-md">
              yooo my guy
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="mt-1 sm:mt-2 w-full rounded-lg transition-colors text-sm">
                See details
              </Button>
            </DrawerTrigger>
            <DrawerContent className="w-full sm:max-w-md">
              yooo my guy
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
};
