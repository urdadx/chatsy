// https://developers.cloudflare.com/fundamentals/reference/http-request-headers/

export function getLocationFromCloudflare(headers: Headers) {
  const city = headers.get("cf-ipcity") || "Accra";
  const region = headers.get("cf-region-code") || "Greater Accra";
  const country = headers.get("cf-ipcountry") || "GH";
  const continent = headers.get("cf-ipcontinent") || "AF";

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
