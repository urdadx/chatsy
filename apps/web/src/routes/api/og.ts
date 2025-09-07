import { generateOGImage } from "@/lib/og/generator";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/og").methods({
  GET: async () => {
    try {
      const image = await generateOGImage();

      // Set appropriate headers
      const response = new Response(image.body, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        },
      });

      return response;
    } catch (error) {
      console.error("Error generating OG image:", error);
      return new Response("Error generating image", { status: 500 });
    }
  },
});
