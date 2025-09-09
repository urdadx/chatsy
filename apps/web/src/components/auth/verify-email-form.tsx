import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface VerifyEmailFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function VerifyEmailForm({ className, ...props }: VerifyEmailFormProps) {
  const [_isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isResending, setIsResending] = React.useState<boolean>(false);
  const [countdown, setCountdown] = React.useState<number>(0);
  const { data: session } = useSession();

  const search = useSearch({
    from: "/(auth)/verify-email",
  });

  const navigate = useNavigate();

  // Countdown timer effect
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [countdown]);

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

  const handleResendVerificationEmail = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      await authClient.sendVerificationEmail(
        {
          email: session?.user?.email || "",
          callbackURL: "/onboarding",
        },
        {
          onSuccess: () => {
            toast.success("Verification email sent successfully!");
            setCountdown(30);
          },
          onError: (ctx) => {
            toast.error(
              ctx.error.message || "Failed to send verification email",
            );
          },
        },
      );
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast.error("Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

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
            Click the link in your email to confirm your email address.
          </p>
          <form onSubmit={handleVerifyEmail} className="w-full">
            {/* Uncomment if you want to show the verify button */}
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
      <div className="text-muted-foreground text-center text-sm">
        Didn't receive the email?{" "}
        <button
          type="button"
          onClick={handleResendVerificationEmail}
          disabled={countdown > 0 || isResending}
          className={cn(
            "underline font-semibold underline-offset-4 transition-colors",
            countdown > 0 || isResending
              ? "text-muted-foreground cursor-not-allowed"
              : "text-primary hover:text-primary/80",
          )}
        >
          {isResending ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Sending...
            </>
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            "Resend verification email"
          )}
        </button>
      </div>
    </div>
  );
}
