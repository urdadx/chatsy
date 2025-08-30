import React from "react";

interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  continent?: string;
  ip?: string;
}

/**
 * Get user's location using client-side IP geolocation services
 */
export async function getClientLocation(): Promise<string | null> {
  // Check if location is already cached in session storage
  const cachedLocation = sessionStorage.getItem("user_location");
  if (cachedLocation && cachedLocation !== "null") {
    return cachedLocation;
  }

  const locationAPIs = [
    {
      name: "ipapi.co",
      url: "https://ipapi.co/json/",
      timeout: 3000,
      parser: (data: any): LocationData => ({
        city: data.city,
        region: data.region,
        country: data.country_name,
        country_code: data.country_code,
        continent: data.continent_code || data.continent || null,
        ip: data.ip,
      }),
    },
    {
      name: "ipinfo.io",
      url: "https://ipinfo.io/json",
      timeout: 3000,
      parser: (data: any): LocationData => ({
        city: data.city,
        region: data.region,
        country: data.country,
        country_code: data.country,
        continent: "Unknown",
        ip: data.ip,
      }),
    },
  ];

  for (const api of locationAPIs) {
    try {
      console.debug(`Trying location API: ${api.name}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), api.timeout);

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check if the API returned an error
      if (data.error || data.status === "fail") {
        throw new Error(
          data.error || data.message || "API returned error status",
        );
      }

      const locationData = api.parser(data);

      // Validate that we got meaningful data
      if (!locationData.country && !locationData.city) {
        throw new Error("No location data received");
      }

      console.debug(
        `Location fetched successfully from ${api.name}:`,
        locationData,
      );

      // Format location as "City, Country Code" or just "Country Code" if no city
      let location: string | null = null;
      if (locationData.city && locationData.country_code) {
        location = `${locationData.city}, ${locationData.country_code}`;
      } else if (locationData.country_code) {
        location = locationData.country_code;
      } else if (locationData.country) {
        location = locationData.country;
      }

      // Cache the location in session storage
      if (location) {
        sessionStorage.setItem("user_location", location);
      }

      return location;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn(`Location API ${api.name} failed:`, errorMessage);
    }
  }

  console.warn("All location APIs failed, proceeding without location data");
  sessionStorage.setItem("user_location", "null");
  return null;
}

/**
 * Hook to get user location with caching
 */
export function useClientLocation() {
  const [location, setLocation] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userLocation = await getClientLocation();
        if (isMounted) {
          setLocation(userLocation);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to get location",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, isLoading, error };
}
