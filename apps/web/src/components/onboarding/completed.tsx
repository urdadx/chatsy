import { containerVariants } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button";

export const Completed = () => {
  const { previousStep } = useStepperStore();
  const navigate = useNavigate();

  return (
    <>
      <Confetti
        recycle={false}
        initialVelocityY={30}
        gravity={0.6}
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={500}
      />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pt-6"
      >
        <div className="flex flex-col gap-6 min-h-[310px] ">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              {`You're all set!`}
            </h1>
            <p className="text-start  text-muted-foreground">
              Your bot is ready to go.
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={previousStep} variant="outline" type="button">
            Previous
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                navigate({ to: "/admin/playground" });
              }}
              className=""
            >
              Finish
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};
