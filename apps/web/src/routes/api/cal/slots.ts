import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/cal/slots").methods({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const eventTypeId = url.searchParams.get("eventTypeId");
      const startTime = url.searchParams.get("startTime");
      const endTime = url.searchParams.get("endTime");

      if (!eventTypeId || !startTime || !endTime) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const calApiKey = process.env.CAL_API_KEY;
      if (!calApiKey) {
        return new Response(
          JSON.stringify({ error: "Cal.com API key not configured" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Fetch available slots from Cal.com API
      const slotsUrl = new URL("https://api.cal.com/v2/slots");
      slotsUrl.searchParams.set("eventTypeId", eventTypeId);
      slotsUrl.searchParams.set("startTime", startTime);
      slotsUrl.searchParams.set("endTime", endTime);

      const response = await fetch(slotsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${calApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cal.com API error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to fetch slots from Cal.com" }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching Cal.com slots:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
