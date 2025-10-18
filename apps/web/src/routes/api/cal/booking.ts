import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/cal/booking").methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { eventTypeId, start, attendeeName, attendeeEmail, notes } = body;

      if (!eventTypeId || !start || !attendeeName || !attendeeEmail) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
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

      // Create booking via Cal.com API
      const response = await fetch("https://api.cal.com/v2/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${calApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTypeId: Number.parseInt(eventTypeId),
          start,
          attendee: {
            name: attendeeName,
            email: attendeeEmail,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          meetingUrl: body.meetingUrl || undefined,
          metadata: notes ? { notes } : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cal.com booking creation error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create booking" }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const bookingData = await response.json();

      // If booking requires confirmation, confirm it
      if (bookingData.data?.uid && bookingData.data?.status === "PENDING") {
        const confirmResponse = await fetch(
          `https://api.cal.com/v2/bookings/${bookingData.data.uid}/confirm`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${calApiKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (confirmResponse.ok) {
          const confirmedData = await confirmResponse.json();
          return new Response(JSON.stringify(confirmedData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify(bookingData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating Cal.com booking:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
