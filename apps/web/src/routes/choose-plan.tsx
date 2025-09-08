import { Pricing } from "@/components/landing-page/pricing";
import { useSession } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/choose-plan")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = useSession();

  console.log("Session:", session);

  return (
    <main className="w-full bg-white min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4"
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Pricing />
      </motion.div>
      {/* <Link to="/admin/overview">
        <Button variant="link">Skip for now👉</Button>
      </Link> */}
    </main>
  );
}
