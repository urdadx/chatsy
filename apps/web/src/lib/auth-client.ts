import { polarClient } from "@polar-sh/better-auth";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL,

  plugins: [organizationClient(), polarClient()],
});

export const { useSession, signIn, signUp, signOut, checkout } = authClient;
