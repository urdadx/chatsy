import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import z from "zod";

export const Route = createFileRoute("/accept-invitation")({
  component: RouteComponent,
  validateSearch: z.object({
    invitationId: z.string(),
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { invitationId } = useSearch({
    from: "/accept-invitation",
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      const { data } = await authClient.organization.acceptInvitation({
        invitationId,
      });
      return data;
    },
    onSuccess: () => {
      navigate({
        to: "/admin/overview",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAcceptInvitation = () => {
    acceptInvitationMutation.mutate();
  };

  return (
    <>
      <main className="relative min-h-screen w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] before:absolute before:-z-10 before:inset-0 before:bg-[radial-gradient(circle_at_left,rgba(251,146,60,0.05),rgba(139,92,246,0.05),transparent_50%)] after:absolute after:-z-10 after:inset-0 after:bg-[radial-gradient(circle_at_right,rgba(251,146,60,0.05),rgba(139,92,246,0.05),transparent_50%)]">
        <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
          <Card className="w-full max-w-md bg-white ">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="relative mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white stroke-[3]" />
                </div>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Click to accept your invitation
              </h1>
              <p className="text-gray-500 text-sm mb-6 sm:mb-8 leading-relaxed">
                Click the button below to accept your invitation
              </p>
              <div className="flex flex-col gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleAcceptInvitation}
                    disabled={acceptInvitationMutation.isPending}
                    className="w-full text-sm sm:text-base py-2.5 sm:py-3"
                  >
                    {acceptInvitationMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      "Accept Invitation"
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
