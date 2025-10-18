import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

// ============================================================================
// Location API using Cloudflare Headers
// ============================================================================

export const ServerRoute = createServerFileRoute("/api/location").methods({
  GET: async ({ request }) => {
    try {
      // Get Cloudflare headers
      // https://developers.cloudflare.com/fundamentals/reference/http-request-headers/
      const headers = request.headers;

      const city = headers.get("cf-ipcity") || "Accra";
      const region = headers.get("cf-region") || "Greater Accra";
      const country = headers.get("cf-ipcountry") || "Ghana";
      const latitude = headers.get("cf-iplatitude");
      const longitude = headers.get("cf-iplongitude");
      const timezone = headers.get("cf-timezone") || "Africa/Accra";

      // Get IP from CF-Connecting-IP (the real client IP) or X-Forwarded-For
      const ip =
        headers.get("cf-connecting-ip") ||
        headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        headers.get("x-real-ip") ||
        null;

      // Map country code to continent
      const getContinent = (countryCode: string): string => {
        // Africa
        if (
          /^(DZ|AO|BJ|BW|BF|BI|CM|CV|CF|TD|KM|CG|CD|CI|DJ|EG|GQ|ER|ET|GA|GM|GH|GN|GW|KE|LS|LR|LY|MG|MW|ML|MR|MU|YT|MA|MZ|NA|NE|NG|RE|RW|ST|SN|SC|SL|SO|ZA|SS|SD|SZ|TZ|TG|TN|UG|EH|ZM|ZW)$/i.test(
            countryCode,
          )
        ) {
          return "Africa";
        }
        // Europe
        if (
          /^(AL|AD|AT|BY|BE|BA|BG|HR|CY|CZ|DK|EE|FO|FI|FR|DE|GI|GR|HU|IS|IE|IM|IT|XK|LV|LI|LT|LU|MK|MT|MD|MC|ME|NL|NO|PL|PT|RO|RU|SM|RS|SK|SI|ES|SE|CH|UA|GB|VA)$/i.test(
            countryCode,
          )
        ) {
          return "Europe";
        }
        // Asia
        if (
          /^(AF|AM|AZ|BH|BD|BT|BN|KH|CN|GE|HK|IN|ID|IR|IQ|IL|JP|JO|KZ|KW|KG|LA|LB|MO|MY|MV|MN|MM|NP|KP|OM|PK|PS|PH|QA|SA|SG|KR|LK|SY|TW|TJ|TH|TL|TR|TM|AE|UZ|VN|YE)$/i.test(
            countryCode,
          )
        ) {
          return "Asia";
        }
        // North America
        if (
          /^(AG|BS|BB|BZ|CA|CR|CU|DM|DO|SV|GD|GT|HT|HN|JM|MX|NI|PA|KN|LC|VC|TT|US)$/i.test(
            countryCode,
          )
        ) {
          return "North America";
        }
        // South America
        if (
          /^(AR|BO|BR|CL|CO|EC|FK|GF|GY|PY|PE|SR|UY|VE)$/i.test(countryCode)
        ) {
          return "South America";
        }
        // Oceania
        if (
          /^(AS|AU|CK|FJ|PF|GU|KI|MH|FM|NR|NC|NZ|NU|NF|MP|PW|PG|PN|WS|SB|TK|TO|TV|VU|WF)$/i.test(
            countryCode,
          )
        ) {
          return "Oceania";
        }
        // Antarctica
        if (/^(AQ|BV|GS|HM|TF)$/i.test(countryCode)) {
          return "Antarctica";
        }
        return "Unknown";
      };

      const locationData = {
        city,
        region,
        country,
        country_code: country,
        continent: getContinent(country),
        ip,
        timezone,
        coordinates:
          latitude && longitude
            ? {
                latitude: Number.parseFloat(latitude),
                longitude: Number.parseFloat(longitude),
              }
            : null,
      };

      return json(locationData, { status: 200 });
    } catch (error) {
      console.error("Error fetching location:", error);

      // Return Ghana, Accra as fallback
      return json(
        {
          city: "Accra",
          region: "Greater Accra",
          country: "Ghana",
          country_code: "GH",
          continent: "Africa",
          ip: null,
          timezone: "Africa/Accra",
          coordinates: null,
        },
        { status: 200 },
      );
    }
  },
});
