import { Logo } from "@/components/logo-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/invitation-success")({
  component: RouteComponent,
  validateSearch: z.object({
    organizationName: z.string().optional(),
  }),
});

function RouteComponent() {
  const { organizationName } = useSearch({
    from: "/invitation-success",
  });

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

          <Card>
            <CardHeader className="text-center space-y-4">

              <div className="space-y-2">
                <h1 className="text-3xl instrument-serif-regular font-semibold tracking-tight">
                  Welcome to the Team! 🎉
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {organizationName
                    ? `You've successfully joined ${organizationName}. Let's get started!`
                    : "You've successfully joined the team. Let's get started!"}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/admin/overview">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
