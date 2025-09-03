import { polarClient } from "@polar-sh/better-auth";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",

  plugins: [organizationClient(), polarClient()],
});

export const { useSession, signIn, signUp, signOut, checkout } = authClient;
