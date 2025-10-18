import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/cal/slots").methods({
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const username = url.searchParams.get("username");
      const eventSlug = url.searchParams.get("eventSlug");
      const startTime = url.searchParams.get("startTime");
      const endTime = url.searchParams.get("endTime");

      if (!username || !eventSlug || !startTime || !endTime) {
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

      const slotsUrl = new URL("https://api.cal.com/v2/slots");
      slotsUrl.searchParams.set("username", username);
      slotsUrl.searchParams.set("eventTypeSlug", eventSlug);
      slotsUrl.searchParams.set("start", startTime);
      slotsUrl.searchParams.set("end", endTime);

      const response = await fetch(slotsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${calApiKey}`,
          "Content-Type": "application/json",
          "cal-api-version": "2024-09-04",
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
      const slotsData = data.data || {};
      const transformedSlots = [];

      for (const [, times] of Object.entries(slotsData)) {
        if (Array.isArray(times)) {
          for (const slot of times) {
            if (typeof slot === "object" && slot !== null) {
              transformedSlots.push({
                time: slot.start,
              });
            } else if (typeof slot === "string") {
              transformedSlots.push({
                time: slot,
              });
            }
          }
        }
      }

      return new Response(JSON.stringify({ slots: transformedSlots }), {
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
