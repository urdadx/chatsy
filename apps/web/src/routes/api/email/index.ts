import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/email/").methods({
  POST: async ({ request }) => {},
});
