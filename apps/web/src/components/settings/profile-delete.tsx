import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

export const ProfileDelete = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const ConfirmationContent = () => (
    <>
      <div className="space-y-2 sm:space-y-3 mt-4">
        <div className="text-base sm:text-lg flex items-center gap-1 sm:gap-2">
          <div
            className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <CircleAlert className="opacity-80" size={14} strokeWidth={2} />
          </div>
          Delete account
        </div>
        <div className="text-md md:text-md text-start px-4 sm:px-6 text-muted-foreground">
          Are you sure you want to delete your account? This action cannot be
          undone.
        </div>
      </div>
      <div className="mt-4 sm:mt-6 flex flex-row justify-end gap-2 sm:gap-3">
        {!isMobile ? (
          <DialogClose asChild>
            <Button
              variant="outline"
              className="text-xs sm:text-sm py-1.5 sm:py-2"
            >
              Cancel
            </Button>
          </DialogClose>
        ) : (
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="text-xs sm:text-sm py-1.5 sm:py-2"
            >
              Cancel
            </Button>
          </DrawerClose>
        )}
        <Button
          variant="destructive"
          className="transition-all text-xs sm:text-sm py-1.5 sm:py-2"
        >
          Yes, delete
        </Button>
      </div>
    </>
  );

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-red-300 overflow-hidden">
        <div className="p-6">
          <h2 className="text-base font-semibold mb-2">Delete Account</h2>
          <p className="text-gray-600 text-sm">
            Permanently remove your account and all of its contents. This action
            is not reversible, so please continue with caution.
          </p>
        </div>
        <div className="bg-red-50 px-6 py-4 flex justify-end border-t border-red-300">
          {!isMobile ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-[500px] px-4 py-4 sm:px-6 sm:py-4">
                <DialogHeader>
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border"
                      aria-hidden="true"
                    >
                      <CircleAlert
                        className="opacity-80"
                        size={16}
                        strokeWidth={2}
                      />
                    </div>
                    Are you sure?
                  </DialogTitle>
                  <DialogDescription className="text-md text-start px-6">
                    Deleting your account is irreversible and will delete all
                    your data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row items-center justify-end gap-2 ">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    className="transition-all text-white text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Yes, delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  Delete Account
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4 py-4">
                <DrawerHeader className="text-left p-0">
                  <DrawerTitle className="sr-only">Confirm Delete</DrawerTitle>
                </DrawerHeader>
                <ConfirmationContent />
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  );
};
