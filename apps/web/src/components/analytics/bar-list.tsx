import { Globe, ShoppingCart, Users } from "lucide-react";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useMemo,
} from "react";
import { ScrollArea } from "../ui/scroll-area";
import { LineItem } from "./line-item";

interface BarListProps {
  tab: string;
  unit: string;
  data: {
    icon: ReactNode;
    title: string;
    href: string;
    value: number;
    linkId?: string;
  }[];
  maxValue: number;
  barBackground: string;
  hoverBackground: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  limit?: number;
  minBarWidth?: number;
}

const dummyData = [
  {
    icon: <Globe className="h-4 w-4" />,
    title: "example.com",
    href: "/example",
    value: 1000,
    linkId: "1",
  },
  {
    icon: <ShoppingCart className="h-4 w-4" />,
    title: "shop.com",
    href: "/shop",
    value: 900,
    linkId: "2",
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "community.org",
    href: "/community",
    value: 500,
    linkId: "3",
  },
  {
    icon: <Globe className="h-4 w-4" />,
    title: "blog.com",
    href: "/blog",
    value: 300,
    linkId: "4",
  },
];

export default function BarList({
  tab = "Websites",
  unit = "visits",
  data = dummyData,
  barBackground = "bg-blue-500",
  hoverBackground = "hover:bg-gray-100",
  maxValue,
  limit,
  minBarWidth = 10,
}: Partial<BarListProps>) {
  const calculatedMaxValue = useMemo(() => {
    if (maxValue) return maxValue;
    return data.length > 0 ? Math.max(...data.map((item) => item.value)) : 1000;
  }, [data, maxValue]);

  const filteredData = useMemo(() => {
    if (limit) {
      return data.slice(0, limit);
    }
    return data;
  }, [data, limit]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const bars = (
    <div className="grid gap-2">
      {sortedData.map((item, idx) => (
        <LineItem
          key={idx}
          {...item}
          maxValue={calculatedMaxValue}
          tab={tab}
          unit={unit}
          barBackground={barBackground}
          hoverBackground={hoverBackground}
          minBarWidth={minBarWidth}
        />
      ))}
    </div>
  );

  if (limit) {
    return bars;
  }

  return (
    <>
      <ScrollArea className="h-[45vh] z-0 md:h-[45vh] pr-4">
        {bars}
        <div className="h-8" />
      </ScrollArea>
    </>
  );
}
