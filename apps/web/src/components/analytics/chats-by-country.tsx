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
import BarList from "./bar-list";

import { getCountryCode, getCountryCodeFromCity } from "@/constants/counties";
import { Maximize2, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { ViewAllStats } from "./view-all-stats";

export function ChatsByCountry() {
  const [countriesDialogOpen, setCountriesDialogOpen] = useState(false);
  const [citiesDialogOpen, setCitiesDialogOpen] = useState(false);
  const [continentsDialogOpen, setContinentsDialogOpen] = useState(false);

  const dummyCountries = [
    { country: "United States", totalCount: 120 },
    { country: "Canada", totalCount: 95 },
    { country: "Germany", totalCount: 75 },
  ];

  const dummyCities = [
    { city: "New York", totalCount: 80 },
    { city: "Toronto", totalCount: 70 },
    { city: "Berlin", totalCount: 65 },
  ];

  const dummyContinents = [
    { continent: "North America", totalCount: 200 },
    { continent: "Europe", totalCount: 150 },
    { continent: "South America", totalCount: 100 },
  ];

  const mapCountries = dummyCountries.map((country) => {
    const countryCode = getCountryCode(country.country) || "unknown";
    const iconSrc = `https://flag.vercel.app/m/${countryCode}.svg`;

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

  const mapCities = dummyCities.map((city) => {
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
      linkId: "",
    };
  });

  const mapContinents = dummyContinents.map((continent) => {
    let icon = null;
    const name = continent.continent;
    if (name === "Africa") icon = <Africa className="w-4" />;
    else if (name === "Asia") icon = <Asia className="w-4" />;
    else if (name === "Europe") icon = <Europe className="w-4" />;
    else if (name === "North America" || name === "NorthAmerica")
      icon = <NorthAmerica className="w-4" />;
    else if (name === "Oceania") icon = <Oceania className="w-4" />;
    else if (name === "South America" || name === "SouthAmerica")
      icon = <SouthAmerica className="w-4" />;

    return {
      icon,
      title: name,
      href: "",
      value: continent.totalCount,
      linkId: "",
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
    <div className="h-[350px] w-full rounded-xl border bg-white">
      <Tabs defaultValue="countries">
        <div className="flex items-center justify-between px-4 py-3">
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
              <MousePointerClick className="h-4 w-4" /> Chats
            </div>
          </div>
        </div>

        <TabsContent value="countries">
          <div className="px-4 relative">
            <div className="relative">
              <BarList
                tab="Websites"
                unit="visits"
                data={topCountries}
                barBackground="bg-green-200"
                hoverBackground="hover:bg-green-50"
                maxValue={maxCountryCount}
              />
              {hasMoreCountries && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => setCountriesDialogOpen(true)}
                    className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                  >
                    <Maximize2 className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              )}
            </div>
          </div>
          <ViewAllStats
            name="countries"
            dialogOpen={countriesDialogOpen}
            setDialogOpen={setCountriesDialogOpen}
            allLinks={mapCountries}
            maxTotalCount={maxCountryCount}
          />
        </TabsContent>

        <TabsContent value="cities">
          <div className="px-4 relative">
            <div className="relative">
              <BarList
                tab="Websites"
                unit="visits"
                data={topCities}
                barBackground="bg-green-200"
                hoverBackground="hover:bg-green-50"
                maxValue={maxCityCount}
              />
              {hasMoreCities && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => setCitiesDialogOpen(true)}
                    className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                  >
                    <Maximize2 className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              )}
            </div>
          </div>
          <ViewAllStats
            name="cities"
            dialogOpen={citiesDialogOpen}
            setDialogOpen={setCitiesDialogOpen}
            allLinks={mapCities}
            maxTotalCount={maxCityCount}
          />
        </TabsContent>

        <TabsContent value="continents">
          <div className="px-4 relative">
            <div className="relative">
              <BarList
                tab="Websites"
                unit="visits"
                data={topContinents}
                barBackground="bg-green-200"
                hoverBackground="hover:bg-green-50"
                maxValue={maxContinentCount}
              />
              {hasMoreContinents && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => setContinentsDialogOpen(true)}
                    className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                  >
                    <Maximize2 className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              )}
            </div>
          </div>
          <ViewAllStats
            name="continents"
            dialogOpen={continentsDialogOpen}
            setDialogOpen={setContinentsDialogOpen}
            allLinks={mapContinents}
            maxTotalCount={maxContinentCount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
