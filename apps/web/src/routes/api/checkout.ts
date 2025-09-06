import { Checkout } from "@polar-sh/tanstack-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/checkout").methods({
  GET: Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: "http://localhost:3001/success",
    server: "sandbox",
  }),
});
