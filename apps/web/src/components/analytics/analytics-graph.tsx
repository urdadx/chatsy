import * as React from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDuration,
  useRealTimeAnalytics,
} from "@/hooks/use-analytics-stream";
import { useChatHistory } from "@/hooks/use-chat-history";
import NumberFlow from "@number-flow/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Loader } from "../ui/loader";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },

  chats: {
    label: "Chats",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface ChatAnalyticsProps {
  visitorData?: any[];
}

export function ChatAnalytics({
  visitorData: propVisitorData,
}: ChatAnalyticsProps) {
  const navigate = useNavigate({ from: "/admin/analytics" });
  const { timeRange } = useSearch({ from: "/admin/analytics" });
  const selectedTimeRange =
    (timeRange as "24h" | "7d" | "30d" | "90d") || "24h";

  const handleTimeRangeChange = (value: string) => {
    navigate({ search: { timeRange: value as "24h" | "7d" | "30d" | "90d" } });
  };

  const { data, isLoading } = useChatHistory(selectedTimeRange);

  // Use prop data if provided, otherwise fetch it
  const visitorData = propVisitorData;

  // Only show loading if we're actually fetching data (not when prop data is provided)
  const shouldShowLoading = propVisitorData ? isLoading : isLoading;

  const {
    data: realTimeData,
    isConnected,
    error: realtimeError,
  } = useRealTimeAnalytics();

  // Flatten all pages of chats
  const allChats = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.chats || []);
  }, [data]);

  // Aggregate chats per day for the chart
  const chartData = React.useMemo(() => {
    const map = new Map();
    allChats.forEach((chat) => {
      const date = new Date(chat.createdAt || chat.date)
        .toISOString()
        .slice(0, 10);
      map.set(date, (map.get(date) || 0) + 1);
    });
    // Sort by date ascending
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, chats]) => ({ date, chats }));
  }, [allChats]);

  // Aggregate visits per day for the graph
  const visitsChartData = React.useMemo(() => {
    if (!Array.isArray(visitorData)) return [];
    const map = new Map();
    visitorData.forEach((visit) => {
      const date = new Date(visit.createdAt || visit.date)
        .toISOString()
        .slice(0, 10);
      map.set(date, (map.get(date) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, visitors]) => ({ date, visitors }));
  }, [visitorData]);

  // Merge chats and visits data by date for the chart
  const mergedChartData = React.useMemo(() => {
    const map = new Map();
    chartData.forEach((item) => {
      map.set(item.date, { date: item.date, chats: item.chats, visitors: 0 });
    });
    visitsChartData.forEach((item) => {
      if (map.has(item.date)) {
        map.get(item.date).visitors = item.visitors;
      } else {
        map.set(item.date, {
          date: item.date,
          chats: 0,
          visitors: item.visitors,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [chartData, visitsChartData]);

  // Use real-time data for all metrics
  const totalVisits = isConnected
    ? realTimeData.totalVisits
    : Array.isArray(visitorData)
      ? visitorData.length
      : 0;

  const totalChats = allChats.length;

  // All metrics come from real-time data
  const averageSessionTime = realTimeData.averageSessionTime;
  const activeVisitors = realTimeData.activeVisitors;

  const [showChats, setShowChats] = React.useState(true);
  const [showVisitors, setShowVisitors] = React.useState(true);

  return (
    <div className="mt-4 flex flex-col space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="sm:flex items-center gap-3 mb-2 px-2">
          <h1 className="text-xl font-semibold ">Analytics</h1>
          {/* Real-time connection status */}
          {realtimeError && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                window.location.reload();
              }}
            >
              <RefreshCcw />
              Refresh for latest data
            </Button>
          )}
        </div>

        <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger
            className="w-fit sm:w-[250px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="24h" className="rounded-lg">
              Last 24 hours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="px-1 py-5 w-full rounded-xl border bg-white">
        <CardHeader className=" flex flex-row flex-wrap justify-between gap-4">
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full group-hover:animate-none bg-yellow-500" />
                <span>Total visits</span>
              </div>
              <Checkbox
                checked={showVisitors}
                onCheckedChange={(checked) => setShowVisitors(checked === true)}
              />
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              {!isConnected ? (
                "..."
              ) : (
                <div className="flex items-center gap-2">
                  <NumberFlow value={totalVisits} />
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full group-hover:animate-none bg-purple-500" />
                <span>Total chats</span>
              </div>
              <Checkbox
                checked={showChats}
                onCheckedChange={(checked) => setShowChats(checked === true)}
              />
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              {shouldShowLoading ? "..." : <NumberFlow value={totalChats} />}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full group-hover:animate-none bg-orange-500" />
                <span>Avg. session time </span>
              </div>
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              {!isConnected ? (
                "..."
              ) : (
                <div className="flex items-center gap-2">
                  {formatDuration(averageSessionTime)}
                </div>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Loader
                  variant="pulse-dot"
                  className="inset-0 size-2 bg-green-500"
                />
                <span>Live users </span>
              </div>
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              {!isConnected ? (
                <NumberFlow value={0} />
              ) : (
                <div className="flex items-center gap-2">
                  <NumberFlow value={activeVisitors} />
                </div>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className=" pt-4  sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <ComposedChart data={mergedChartData}>
              <defs>
                <linearGradient id="fillChats" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chats)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chats)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-4)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-4)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {/* Render Area first (behind) */}
              {showVisitors && (
                <Area
                  dataKey="visitors"
                  type="natural"
                  fill="url(#fillVisitors)"
                  stroke="var(--chart-4)"
                  fillOpacity={0.3}
                />
              )}
              {/* Render Bar second (in front) */}
              {showChats && (
                <Bar
                  dataKey="chats"
                  fill="var(--color-chats)"
                  radius={[8, 8, 0, 0]}
                  barSize={24}
                  fillOpacity={0.8}
                />
              )}
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </div>
    </div>
  );
}
