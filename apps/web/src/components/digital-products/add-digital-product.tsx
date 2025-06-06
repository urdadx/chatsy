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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CourseForm } from "./course-form";
import { MerchForm } from "./merch-form";

export const AddDigitalProduct = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button>
            <CirclePlus className="text-white mr-1 font-semibold" />
            Add new product
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-md">What are you selling?</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="tab-1" className="items-start">
          <TabsList className="bg-transparent px-0">
            <TabsTrigger
              value="tab-1"
              className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              I want to sell my merch
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="data-[state=active]:bg-muted data-[state=active]:shadow-none"
            >
              I want to sell my course
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">
            <MerchForm />
          </TabsContent>
          <TabsContent value="tab-2">
            <CourseForm />
          </TabsContent>
          <TabsContent value="tab-3">
            <p className="text-muted-foreground p-4 text-center text-xs">
              Content for Tab 3
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
