import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Spinner from "../ui/spinner";
import { GoogleSVG } from "./google-svg";

interface InviteSetupData {
  name: string;
  email: string;
  password: string;
}

export function InviteSetup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteSetupData>();

  const { invitationId } = useSearch({
    from: "/(auth)/setup",
  });

  const handleRegister = async (data: InviteSetupData) => {
    await signUp.email(
      {
        email: data.email,
        name: data.name,
        password: data.password,
        // Skip email verification for invited users since they were invited via email
        callbackURL: `/api/accept-invitation/${invitationId}`,
      },
      {
        onSuccess: (ctx: any) => {
          console.log("Registration successful", ctx);
          toast.success("Account created successfully");
          // Redirect to the invitation acceptance API which will handle verification and subscription
          window.location.href = `/api/accept-invitation/${invitationId}`;
        },
        onError: (ctx: any) => {
          toast.error(
            ctx.error.message || "An error occurred. Please try again.",
          );
        },
      },
    );
  };
  const handleGoogleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    await signIn.social(
      {
        provider: "google",
        callbackURL: `/api/accept-invitation/${invitationId}`,
      },
      {
        onSuccess: () => {
          // Redirect will be handled by callbackURL
          toast.success("Signed in successfully");
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
            Setup Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)}>
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    className="sm:text-xs text-sm"
                    placeholder="Enter your name"
                    {...register("name", {
                      required: "Your full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name">Email</Label>
                  <Input
                    id="email"
                    type="text"
                    className="sm:text-xs text-sm"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "Your full email is required",
                      minLength: {
                        value: 2,
                        message: "Email must be at least 2 characters",
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password"
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
                    <p className="text-sm text-red-500">
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
                      <Spinner className="text-white" />
                    ) : (
                      <>Complete Setup</>
                    )}
                  </Button>
                </motion.div>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline font-semibold text-primary underline-offset-4"
                >
                  Log in
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
