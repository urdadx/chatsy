import { containerVariants } from "@/lib/utils";
import { motion } from "framer-motion";

export const Completed = () => {
  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-6"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              {`You're all set!`}
            </h1>
            <p className="text-start  text-muted-foreground">
              Your bot is ready to go.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
