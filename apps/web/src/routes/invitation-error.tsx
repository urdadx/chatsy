import { Logo } from "@/components/logo-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, createFileRoute, useSearch } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import z from "zod";

export const Route = createFileRoute("/invitation-error")({
  component: RouteComponent,
  validateSearch: z.object({
    type: z.enum(["expired", "invalid", "accepted", "mismatch"]),
    message: z.string().optional(),
  }),
});

function RouteComponent() {
  const { type, message } = useSearch({
    from: "/invitation-error",
  });

  const getErrorConfig = () => {
    switch (type) {
      case "expired":
        return {
          title: "Invitation Expired",
          description:
            message ||
            "This invitation has expired. Please contact the team administrator to send you a new invitation.",
        };
      case "invalid":
        return {
          title: "Invalid Invitation",
          description:
            message ||
            "This invitation link is invalid or has been revoked. Please contact the team administrator.",
        };
      case "accepted":
        return {
          title: "Already Accepted",
          description:
            message ||
            "This invitation has already been accepted. Please log in to access your account.",
        };
      case "mismatch":
        return {
          title: "Email Mismatch",
          description:
            "Please log in with the email address that received the invitation. If you need to use a different email, contact the team administrator.",
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-gray-500" />,
          title: "Error",
          description: message || "An error occurred with your invitation.",
        };
    }
  };

  const config = getErrorConfig();

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
                  {config.title}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {config.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/login" className="block">
                <Button className="w-full">
                  {type === "accepted" ? "Go to Login" : "Back to Login"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
