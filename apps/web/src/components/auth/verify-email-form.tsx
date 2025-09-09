import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import Spinner from "../ui/spinner";

interface VerifyEmailFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function VerifyEmailForm({ className, ...props }: VerifyEmailFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const search = useSearch({
    from: "/(auth)/verify-email",
  });

  const navigate = useNavigate();

  console.log(search);

  async function handleVerifyEmail(event: React.FormEvent) {
    event.preventDefault();

    if (!(search as any)?.token) {
      toast.error(
        "Email not verified. Please check your email for the verification link.",
      );
      return;
    }

    setIsLoading(true);

    try {
      await authClient.verifyEmail(
        {
          query: {
            token: (search as any)?.token,
            callbackURL: "/onboarding",
          },
        },
        {
          onSuccess: () => {
            toast.success("Email verified successfully!");
            navigate({
              to: "/onboarding",
            });
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl instrument-serif-regular">
            Verify your email
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            Click the link in your email to confirm your
            email address.
          </p>
          <form onSubmit={handleVerifyEmail} className="w-full">
            {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Spinner className="text-white" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </motion.div> */}
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs">
        Didn't receive the email?{" "}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button className="underline font-semibold text-primary underline-offset-4">
          Resend verification email
        </button>
      </div>
    </div>
  );
}
