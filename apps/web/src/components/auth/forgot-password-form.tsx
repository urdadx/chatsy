import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Spinner from "../ui/spinner";

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();

  const navigate = useNavigate();

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    await forgetPassword(
      {
        email: data.email,
        redirectTo: "/reset-password",
      },
      {
        onSuccess: () => {
          toast.success("Password reset email sent! Check your inbox.");
          navigate({
            to: "/login",
          });
        },
        onError: (ctx: any) => {
          toast.error(
            ctx.error.message || "An error occurred. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl instrument-serif-regular">
            Forgot your password?
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleForgotPassword)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="sm:text-xs text-sm"
                  placeholder="jane@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Spinner className="text-white" />
                  ) : (
                    <>
                      Send reset link
                    </>
                  )}
                </Button>
              </motion.div>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
