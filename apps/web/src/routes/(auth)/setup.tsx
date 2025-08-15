import { InviteSetup } from "@/components/auth/invite-setup";
import { Logo } from "@/components/logo-image";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/(auth)/setup")({
  component: RouteComponent,
  validateSearch: z.object({
    email: z.string().email().optional(),
    invitationId: z.string(),
  }),
});

function RouteComponent() {
  return (
    <main className="relative h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] before:absolute before:-z-10 before:inset-0 before:bg-[radial-gradient(circle_at_left,rgba(251,146,60,0.05),rgba(139,92,246,0.05),transparent_50%)] after:absolute after:-z-10 after:inset-0 after:bg-[radial-gradient(circle_at_right,rgba(251,146,60,0.05),rgba(139,92,246,0.05),transparent_50%)]">
      <div className="mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <Logo />
          </a>
          <InviteSetup />
        </div>
      </div>
    </main>
  );
}
