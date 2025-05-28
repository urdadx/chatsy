// routes/api/hello.ts
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/hello")({
  GET: async ({ request }) => {
    return new Response(`Hello, World! from ${request.url}`);
  },
});
