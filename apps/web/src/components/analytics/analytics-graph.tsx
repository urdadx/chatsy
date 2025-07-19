import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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
import NumberFlow from "@number-flow/react";
import { Checkbox } from "../ui/checkbox";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", chats: 150 },
  { date: "2024-04-02", chats: 180 },
  { date: "2024-04-03", chats: 120 },
  { date: "2024-04-04", chats: 260 },
  { date: "2024-04-05", chats: 290 },
  { date: "2024-04-06", chats: 340 },
  { date: "2024-04-07", chats: 180 },
  { date: "2024-04-08", chats: 320 },
  { date: "2024-04-09", chats: 110 },
  { date: "2024-04-10", chats: 190 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },

  chats: {
    label: "Chats",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChatAnalytics() {
  const [timeRange, setTimeRange] = React.useState("24h");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <div className="mt-4 flex flex-col space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold mb-2">Analytics</h1>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[250px] rounded-lg sm:ml-auto sm:flex"
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
                <div className="inset-0 size-2 items-center justify-center rounded-full group-hover:animate-none bg-green-500" />
                <span>Total visits</span>
              </div>
              <Checkbox checked={true} />
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={12} />
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full group-hover:animate-none bg-purple-500" />
                <span>Total chats</span>
              </div>
              <Checkbox checked={true} />
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={234} />
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
              1m 6s
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 text-left min-w-24">
            <CardTitle className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="inset-0 size-2 items-center justify-center rounded-full group-hover:animate-none bg-blue-500" />
                <span>Visitors now </span>
              </div>
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-black">
              <NumberFlow value={4} />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={filteredData}>
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
              <Area
                dataKey="chats"
                type="natural"
                fill="url(#fillChats)"
                stroke="var(--color-chats)"
                stackId="a"
              />

              {/* <ChartLegend content={<ChartLegendContent />} /> */}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </div>
    </div>
  );
}
