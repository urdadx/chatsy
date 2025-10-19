import {
  Africa,
  Asia,
  Europe,
  NorthAmerica,
  Oceania,
  SouthAmerica,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import BarList from "./bar-list";

import { getCountryCode, getCountryCodeFromCity } from "@/constants/counties";
import { Maximize2, MousePointerClick } from "lucide-react";
import { useState } from "react";
import Spinner from "../ui/spinner";
import { ViewAllStats } from "./view-all-stats";

interface ChatsByCountryProps {
  visitorData?: any[];
}

export function ChatsByCountry({
  visitorData: propVisitorData,
}: ChatsByCountryProps) {
  const [countriesDialogOpen, setCountriesDialogOpen] = useState(false);
  const [citiesDialogOpen, setCitiesDialogOpen] = useState(false);
  const [continentsDialogOpen, setContinentsDialogOpen] = useState(false);

  const analytics = propVisitorData;

  const { countryStats, cityStats, continentStats } = useMemo(() => {
    const countryMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};
    const continentMap: Record<string, number> = {};
    analytics?.forEach((row) => {
      if (row.country) {
        countryMap[row.country] = (countryMap[row.country] || 0) + 1;
      }
      if (row.city) {
        cityMap[row.city] = (cityMap[row.city] || 0) + 1;
      }
      if (row.continent) {
        continentMap[row.continent] = (continentMap[row.continent] || 0) + 1;
      }
    });
    return {
      countryStats: Object.entries(countryMap).map(([country, totalCount]) => ({
        country,
        totalCount,
      })),
      cityStats: Object.entries(cityMap).map(([city, totalCount]) => ({
        city,
        totalCount,
      })),
      continentStats: Object.entries(continentMap).map(
        ([continent, totalCount]) => ({ continent, totalCount }),
      ),
    };
  }, [analytics]);

  const mapCountries = countryStats.map((country) => {
    const countryCode = getCountryCode(country.country) || "unknown";
    const iconSrc = `https://flag.vercel.app/m/${country.country}.svg`;
    return {
      icon: (
        <img
          src={iconSrc}
          className="w-4"
          alt={`Flag of ${country.country}`}
          key={country.country}
        />
      ),
      title: country.country,
      href: "",
      value: country.totalCount,
      linkId: "",
    };
  });

  const mapCities = cityStats.map((city) => {
    const countryCode = getCountryCodeFromCity(city.city) || "unknown";
    const iconSrc = `https://flag.vercel.app/m/${countryCode}.svg`;
    return {
      icon: (
        <img
          src={iconSrc}
          className="w-4"
          alt={`Flag of ${city.city}`}
          key={city.city}
        />
      ),
      title: city.city,
      href: "",
      value: city.totalCount,
    };
  });

  const mapContinents = continentStats.map((continent) => {
    let icon = null;
    const name = continent.continent;
    const actualName =
      continent.continent === "AF"
        ? "Africa"
        : continent.continent === "AS"
          ? "Asia"
          : continent.continent === "EU"
            ? "Europe"
            : continent.continent === "NA"
              ? "North America"
              : continent.continent === "OC"
                ? "Oceania"
                : continent.continent === "SA"
                  ? "South America"
                  : continent.continent;

    // Use initials for continent icon mapping
    if (name === "AF" || name === "Africa") {
      icon = <Africa className="w-4" />;
    } else if (name === "AS" || name === "Asia") {
      icon = <Asia className="w-4" />;
    } else if (name === "EU" || name === "Europe") {
      icon = <Europe className="w-4" />;
    } else if (
      name === "NA" ||
      name === "North America" ||
      name === "NorthAmerica"
    ) {
      icon = <NorthAmerica className="w-4" />;
    } else if (name === "OC" || name === "Oceania") {
      icon = <Oceania className="w-4" />;
    } else if (
      name === "SA" ||
      name === "South America" ||
      name === "SouthAmerica"
    ) {
      icon = <SouthAmerica className="w-4" />;
    }

    return {
      icon,
      title: actualName,
      href: "",
      value: continent.totalCount,
    };
  });

  const topCountries = mapCountries.slice(0, 5);
  const topCities = mapCities.slice(0, 5);
  const topContinents = mapContinents.slice(0, 5);

  const hasMoreCountries = mapCountries.length > 5;
  const hasMoreCities = mapCities.length > 5;
  const hasMoreContinents = mapContinents.length > 5;

  const maxCountryCount =
    mapCountries.length > 0
      ? Math.max(...mapCountries.map((c) => c.value), 1)
      : 1;
  const maxCityCount =
    mapCities.length > 0 ? Math.max(...mapCities.map((c) => c.value), 1) : 1;
  const maxContinentCount =
    mapContinents.length > 0
      ? Math.max(...mapContinents.map((c) => c.value), 1)
      : 1;

  return (
    <div className="h-[350px] w-full rounded-xl border bg-white flex flex-col overflow-hidden">
      <Tabs defaultValue="countries" className="flex flex-col h-full">
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
          <TabsList className="h-auto gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
            <TabsTrigger
              value="countries"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Countries
            </TabsTrigger>
            <TabsTrigger
              value="cities"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Cities
            </TabsTrigger>
            <TabsTrigger
              value="continents"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Continents
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <MousePointerClick className="h-4 w-4" /> Location
            </div>
          </div>
        </div>

        {/* Content area - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="countries" className="h-full m-0 p-0">
            {analytics === undefined ? (
              <div className="h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : topCountries.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content area - scrollable if needed */}
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topCountries}
                    barBackground="bg-green-200"
                    hoverBackground="hover:bg-green-50"
                    maxValue={maxCountryCount}
                  />
                </div>
                {/* Button area - fixed at bottom */}
                {hasMoreCountries && (
                  <div className="flex-shrink-0 px-4 py-3 ">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setCountriesDialogOpen(true)}
                        className="text-sm py-2 px-4 rounded-full shadow-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <ViewAllStats
              name="countries"
              dialogOpen={countriesDialogOpen}
              setDialogOpen={setCountriesDialogOpen}
              allLinks={mapCountries}
              maxTotalCount={maxCountryCount}
            />
          </TabsContent>

          <TabsContent value="cities" className="h-full m-0 p-0">
            {analytics === undefined ? (
              <div className="h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : topCities.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content area - scrollable if needed */}
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topCities}
                    barBackground="bg-green-200"
                    hoverBackground="hover:bg-green-50"
                    maxValue={maxCityCount}
                  />
                </div>
                {/* Button area - fixed at bottom */}
                {hasMoreCities && (
                  <div className="flex-shrink-0 px-4 py-3 ">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setCitiesDialogOpen(true)}
                        className="text-sm py-2 px-4 rounded-full shadow-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <ViewAllStats
              name="cities"
              dialogOpen={citiesDialogOpen}
              setDialogOpen={setCitiesDialogOpen}
              allLinks={mapCities}
              maxTotalCount={maxCityCount}
            />
          </TabsContent>

          <TabsContent value="continents" className="h-full m-0 p-0">
            {analytics === undefined ? (
              <div className="h-full flex items-center justify-center">
                <Spinner />
              </div>
            ) : topContinents.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm opacity-80">No data available</span>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content area - scrollable if needed */}
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topContinents}
                    barBackground="bg-green-200"
                    hoverBackground="hover:bg-green-50"
                    maxValue={maxContinentCount}
                  />
                </div>
                {/* Button area - fixed at bottom */}
                {hasMoreContinents && (
                  <div className="flex-shrink-0 px-4 py-3 border-t bg-gray-50/50">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setContinentsDialogOpen(true)}
                        className="text-sm py-2 px-4 rounded-full shadow-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <ViewAllStats
              name="continents"
              dialogOpen={continentsDialogOpen}
              setDialogOpen={setContinentsDialogOpen}
              allLinks={mapContinents}
              maxTotalCount={maxContinentCount}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
