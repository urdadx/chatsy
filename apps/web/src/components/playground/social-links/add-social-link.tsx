import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CirclePlus } from "lucide-react";

export const AddSocialLink = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add social link
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md ">Add new link</DialogTitle>
        </DialogHeader>
        <form>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="title" className="text-sm font-medium">
                Link title
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter link title (e.g: My Website)"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="eg: https://example.com"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" className="bg-purple-600 text-white">
              Add link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
