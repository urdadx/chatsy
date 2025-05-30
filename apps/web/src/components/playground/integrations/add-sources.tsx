import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CirclePlus } from "lucide-react";

export const AddIntegrations = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add integration
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>Add integrations</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
