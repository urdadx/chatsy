import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/cal/booking").methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json();

      console.log("Received booking request:", body);

      // Extract fields - handle both old and new structure
      const username = body.username;
      const eventSlug = body.eventSlug;
      const start = body.start;
      const attendeeName = body.attendee?.name || body.attendeeName;
      const attendeeEmail = body.attendee?.email || body.attendeeEmail;
      const attendeeTimeZone = body.attendee?.timeZone || "UTC";
      const notes = body.notes;

      if (
        !username ||
        !eventSlug ||
        !start ||
        !attendeeName ||
        !attendeeEmail
      ) {
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

      // Create booking via Cal.com API V2
      const bookingPayload = {
        username,
        eventTypeSlug: eventSlug, // Changed from eventSlug
        start,
        attendee: {
          name: attendeeName,
          email: attendeeEmail,
          timeZone: attendeeTimeZone,
        },
        ...(notes && { metadata: { notes } }),
      };

      console.log("Sending to Cal.com:", bookingPayload);

      const response = await fetch("https://api.cal.com/v2/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${calApiKey}`,
          "Content-Type": "application/json",
          "cal-api-version": "2024-08-13", // Changed from 2024-09-04
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cal.com booking creation error:", errorText);
        return new Response(
          JSON.stringify({
            error: "Failed to create booking",
            details: errorText,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const bookingData = await response.json();
      console.log("Cal.com booking response:", bookingData);

      // If booking requires confirmation, confirm it
      if (bookingData.data?.uid && bookingData.data?.status === "PENDING") {
        const confirmResponse = await fetch(
          `https://api.cal.com/v2/bookings/${bookingData.data.uid}/confirm`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${calApiKey}`,
              "Content-Type": "application/json",
              "cal-api-version": "2024-08-13", // Changed from 2024-09-04
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
