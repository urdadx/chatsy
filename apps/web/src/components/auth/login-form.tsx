import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { GoogleSVG } from "./google-svg";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const navigate = useNavigate();

  const handleEmailSignIn = async (data: LoginFormData) => {
    await signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success("Signed in successfully");
          navigate({
            to: "/admin/playground",
          });
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const handleGoogleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    await signIn.social(
      {
        provider: "google",
        callbackURL: "/admin/playground",
      },
      {
        onSuccess: () => {
          navigate({
            to: "/admin/playground",
          });
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl instrument-serif-regular">
            Welcome back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleEmailSignIn)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full"
                  type="button"
                >
                  <GoogleSVG />
                  Continue with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
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
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/"
                      className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    placeholder="Password"
                    id="password"
                    type="password"
                    className="sm:text-xs text-sm"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      pattern: {
                        value: /^(?=.*[!@#$%^&*(),.?":{}|<>])/,
                        message:
                          "Password must contain at least one special character",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm  text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner />
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Continue with email
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="underline font-semibold text-primary underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By continuing, you agree to our <Link to="/">Terms of Service</Link> and{" "}
        <Link to="/">Privacy Policy</Link>.
      </div>
    </div>
  );
}
