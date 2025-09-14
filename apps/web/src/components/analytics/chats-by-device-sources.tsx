import { Button } from "@/components/ui/button";
import {} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { osCodes } from "@/constants/os";
import { detectDevice } from "@/lib/utils";
import {
  Bot,
  Maximize2,
  Monitor,
  MousePointerClick,
  TabletSmartphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { MobilePhone } from "../icons/mobile-phone";
import BarList from "./bar-list";
import { ViewAllStats } from "./view-all-stats";

interface ChatsByDeviceSourcesProps {
  visitorData?: any[];
}

export function ChatsByDeviceSources({
  visitorData: propVisitorData,
}: ChatsByDeviceSourcesProps) {
  const analytics = propVisitorData;

  const [devicesDialogOpen, setDevicesDialogOpen] = useState(false);
  const [browsersDialogOpen, setBrowsersDialogOpen] = useState(false);
  const [osDialogOpen, setOsDialogOpen] = useState(false);

  const metrics = useMemo(() => {
    if (!analytics) return null;
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};

    analytics.forEach((rec: any) => {
      if (rec.userAgent) {
        const originalUserAgent = navigator.userAgent;
        Object.defineProperty(navigator, "userAgent", {
          value: rec.userAgent,
          configurable: true,
        });

        try {
          const deviceInfo = detectDevice();

          let deviceType = rec.deviceType || "other";
          if (deviceInfo.type === "mobile") deviceType = "Mobile";
          else if (deviceInfo.type === "desktop") deviceType = "Desktop";
          else if (deviceInfo.type === "tablet") deviceType = "Tablet";
          else if (rec.deviceType === "bot") deviceType = "Bot";

          deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;

          const browser = deviceInfo.browser || "Unknown";
          browserCounts[browser] = (browserCounts[browser] || 0) + 1;

          const os = deviceInfo.os || "Unknown";
          osCounts[os] = (osCounts[os] || 0) + 1;
        } finally {
          Object.defineProperty(navigator, "userAgent", {
            value: originalUserAgent,
            configurable: true,
          });
        }
      }
    });
    return {
      devices: Object.entries(deviceCounts).map(([deviceType, totalCount]) => ({
        deviceType,
        totalCount,
      })),
      browsers: Object.entries(browserCounts).map(
        ([browserName, totalCount]) => ({ browserName, totalCount }),
      ),
      operatingsystems: Object.entries(osCounts).map(
        ([osName, totalCount]) => ({ osName, totalCount }),
      ),
    };
  }, [analytics]);

  const allDevices = metrics
    ? metrics.devices.map((device: any) => {
        const deviceIcon = {
          Mobile: <MobilePhone className="w-4" />,
          Desktop: <Monitor className="w-4" />,
          Tablet: <TabletSmartphone className="w-4" />,
          Bot: <Bot className="w-4" />,
          other: <TabletSmartphone className="w-4" />,
        };
        const icon = deviceIcon[device.deviceType as keyof typeof deviceIcon];

        return {
          icon,
          title:
            device.deviceType === "other" || device.deviceType == null
              ? "Unknown"
              : device.deviceType,
          href: "",
          value: device.totalCount,
          linkId: "",
        };
      })
    : [];

  const allOperatingSystems = metrics
    ? metrics.operatingsystems.map((os: any) => {
        const osCode =
          osCodes[os.osName as keyof typeof osCodes] ?? osCodes["GNU/Linux"];
        const iconSrc = `../../../public/os/${osCode}.png`;
        const icon = (
          <img key={os.osName} alt="staticon" src={iconSrc} className="w-5" />
        );

        return {
          icon,
          title: os.osName,
          href: "",
          value: os.totalCount,
          linkId: "",
        };
      })
    : [];

  const allBrowsers = metrics
    ? metrics.browsers.map((browser: any) => {
        const iconSrc = `../../../public/browser/${browser.browserName.toLowerCase()}.png`;
        const icon = (
          <img
            key={browser.browserName}
            alt={browser.browserName}
            src={iconSrc}
            className="w-4"
          />
        );

        return {
          icon,
          title: browser.browserName,
          href: "",
          value: browser.totalCount,
          linkId: "",
        };
      })
    : [];

  const topDevices = allDevices.slice(0, 5);
  const topBrowsers = allBrowsers.slice(0, 5);
  const topOperatingSystems = allOperatingSystems.slice(0, 5);

  const hasMoreDevices = allDevices.length > 5;
  const hasMoreBrowsers = allBrowsers.length > 5;
  const hasMoreOS = allOperatingSystems.length > 5;

  const maxBrowserCount =
    allBrowsers.length > 0
      ? Math.max(...allBrowsers.map((browser: any) => browser.value))
      : 0;

  const maxOSCount =
    allOperatingSystems.length > 0
      ? Math.max(...allOperatingSystems.map((os: any) => os.value))
      : 0;

  const maxDeviceCount =
    allDevices.length > 0
      ? Math.max(...allDevices.map((device: any) => device.value))
      : 0;

  return (
    <div className="h-[350px] w-full rounded-xl border bg-white">
      <Tabs defaultValue="tab-1" className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3">
          <TabsList className="h-auto gap-2 rounded-none border-border bg-transparent px-0 text-foreground">
            <TabsTrigger
              value="tab-1"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Devices
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              Browsers
            </TabsTrigger>
            <TabsTrigger
              value="tab-3"
              className="relative text-muted-foreground after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              OS
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <MousePointerClick className="h-4 w-4" /> Devices
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="tab-1" className="h-full m-0 p-0">
            <div className="px-2 relative">
              {allDevices.length === 0 ? (
                <div className="w-full h-[210px] flex items-center justify-center">
                  <span className="text-sm opacity-80">No data available</span>
                </div>
              ) : (
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topDevices}
                    barBackground="bg-red-200"
                    hoverBackground="hover:bg-red-50"
                    maxValue={maxDeviceCount}
                  />
                  {hasMoreDevices && (
                    <div className="flex-shrink-0 px-4 ">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setDevicesDialogOpen(true)}
                          className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <ViewAllStats
              name={"devices"}
              dialogOpen={devicesDialogOpen}
              setDialogOpen={setDevicesDialogOpen}
              allLinks={allDevices}
              maxTotalCount={maxDeviceCount}
            />
          </TabsContent>

          <TabsContent value="tab-2">
            <div className="px-2 relative">
              {allBrowsers.length === 0 ? (
                <div className="w-full h-[210px] flex items-center justify-center">
                  <span className="text-sm opacity-80">No data available</span>
                </div>
              ) : (
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topBrowsers}
                    barBackground="bg-red-200"
                    hoverBackground="hover:bg-red-50"
                    maxValue={maxBrowserCount}
                  />
                  {hasMoreBrowsers && (
                    <div className="flex-shrink-0 px-4 ">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setBrowsersDialogOpen(true)}
                          className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <ViewAllStats
              name={"browsers"}
              dialogOpen={browsersDialogOpen}
              setDialogOpen={setBrowsersDialogOpen}
              allLinks={allBrowsers}
              maxTotalCount={maxBrowserCount}
            />
          </TabsContent>

          <TabsContent value="tab-3">
            <div className="px-2 relative">
              {allOperatingSystems.length === 0 ? (
                <div className="w-full h-[210px] flex items-center justify-center">
                  <span className="text-sm opacity-80">No data available</span>
                </div>
              ) : (
                <div className="flex-1 min-h-0 px-4 pt-4 overflow-hidden">
                  <BarList
                    tab="Websites"
                    unit="visits"
                    data={topOperatingSystems}
                    barBackground="bg-red-200"
                    hoverBackground="hover:bg-red-50"
                    maxValue={maxOSCount}
                  />
                  {hasMoreOS && (
                    <div className="flex-shrink-0 px-4 ">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setOsDialogOpen(true)}
                          className="text-sm py-2 px-4 rounded-full shadow-md font-medium"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <ViewAllStats
              name={"operating systems"}
              dialogOpen={osDialogOpen}
              setDialogOpen={setOsDialogOpen}
              allLinks={allOperatingSystems}
              maxTotalCount={maxOSCount}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
