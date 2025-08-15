import { Pricing } from "@/components/landing-page/pricing";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/choose-plan")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="bg-white">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4"
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Pricing />
      </motion.div>
    </main>
  );
}
