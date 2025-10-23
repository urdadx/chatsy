// https://developers.cloudflare.com/fundamentals/reference/http-request-headers/

export function getLocationFromCloudflare(headers: Headers) {
  const city = headers.get("CF-IPCity") || headers.get("cf-ipcity") || "Accra";
  const region =
    headers.get("CF-Region") ||
    headers.get("CF-Region-Code") ||
    headers.get("cf-region") ||
    headers.get("cf-region-code") ||
    "Greater Accra";
  const country =
    headers.get("CF-IPCountry") || headers.get("cf-ipcountry") || "GH";
  const continent =
    headers.get("CF-IPContinent") || headers.get("cf-ipcontinent") || "AF";

  // Debug: Log all Cloudflare headers to see what's actually available
  const allCfHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("cf-")) {
      allCfHeaders[key] = value;
    }
  });

  console.log("All Cloudflare Headers received:", allCfHeaders);
  console.log("Parsed Location Data:", {
    city,
    region,
    country,
    continent,
  });

  const ip =
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    null;

  return {
    city,
    region,
    country,
    countryCode: country,
    continent: continent,
    ip,
  };
}
