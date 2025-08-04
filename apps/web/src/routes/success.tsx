import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import Confetti from "react-confetti";

export const Route = createFileRoute("/success")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Confetti
        recycle={false}
        initialVelocityY={40}
        gravity={0.6}
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={500}
      />
      <main className="relative min-h-screen w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] before:absolute before:-z-10 before:inset-0 before:bg-[radial-gradient(circle_at_left,rgba(251,146,60,0.05),rgba(139,92,246,0.05),transparent_50%)] after:absolute after:-z-10 after:inset-0 after:bg-[radial-gradient(circle_at_right,rgba(251,146,60,0.05),rgba(139,92,246,0.05),transparent_50%)]">
        <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
          <Card className="w-full max-w-md bg-white ">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="relative mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                Payment successful!
              </h1>

              <p className="text-gray-500 text-sm  mb-6 sm:mb-8 leading-relaxed">
                Your subscription has been successfully processed. You will
                receive a confirmation email shortly.
              </p>

              <div className="flex flex-col gap-3">
                <Link className="w-full" to="/admin/overview">
                  <Button className="w-full text-sm sm:text-base py-2.5 sm:py-3">
                    Continue to dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
