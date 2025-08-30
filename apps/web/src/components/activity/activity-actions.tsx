import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";

export function RowActions({ row }: any) {
  const id = row.original.id;
  const type = row.original.type;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["activity-details", id, type],
    queryFn: async () => {
      const res = await api.get(`/activity/${id}?type=${type}`);
      return res.data.item;
    },
    enabled: false,
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  function getFlagImg(location: string | undefined) {
    if (!location) return null;
    const parts = location.split(",");
    const countryCode = parts.length > 1 ? parts[1].trim() : null;
    if (!countryCode) return null;
    return (
      <img
        src={`https://flag.vercel.app/m/${countryCode}.svg`}
        className="w-4"
        alt={`Flag of ${countryCode}`}
        key={location}
      />
    );
  }

  return (
    <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none text-primary hover:text-purple-400"
            aria-label="Edit item"
          >
            View details
          </Button>
        </div>
      </Drawer.Trigger>
      <Drawer.Overlay className="fixed backdrop-blur-xs inset-0 bg-black/10" />
      <Drawer.Content
        className="right-2 bg-background z-10 top-2 bottom-2 fixed outline-none w-[400px] flex"
        style={{ ["--initial-transform" as any]: "calc(100% + 16px)" }}
      >
        <div className="bg-white h-full w-full grow p-6 flex flex-col rounded-[16px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg capitalize font-medium text-gray-900">
                {type} Information
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Spinner className="text-primary" />
              </div>
            )}

            {isError && (
              <div className="text-destructive py-4">
                Error:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </div>
            )}

            {data && (
              <div className="space-y-6">
                {/* Avatar, Name, Location */}
                <div className="flex flex-col items-center gap-2 mb-4">
                  <Avatar className="size-16 border-2 border-primary">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(data.email || data.name || "anonymous")}`}
                      alt={data.name || "Anonymous"}
                    />
                    <AvatarFallback>
                      {data.name
                        ? data.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base font-semibold text-gray-900">
                    {data.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {data.location || "Not available"}
                  </span>
                </div>
                {/* ...rest of your content... */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Date
                  </span>
                  <span className="col-span-2 text-sm text-gray-900">
                    {data.fibuStartDate ||
                      (data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-")}
                  </span>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Email
                    </span>
                    <span className="col-span-2 text-sm text-gray-900">
                      {data.email || data.contact || "Not provided"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Name
                    </span>
                    <span className="col-span-2 text-sm text-gray-900">
                      {data.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Location
                    </span>
                    <span className="col-span-2 text-sm text-gray-900 flex items-center gap-2">
                      {data.location || "Not available"}
                      {getFlagImg(data.location)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Activity type
                    </span>
                    <span className="col-span-2 capitalize text-sm text-gray-900">
                      {data.type || "-"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Message
                  </span>
                  {!data.subject && !data.message ? (
                    <div
                      className={cn(
                        "text-sm text-gray-900 border w-full flex flex-col gap-3 whitespace-pre-wrap break-words p-4 rounded-lg",
                        data.type === "lead"
                          ? "border-green-300 bg-green-100"
                          : "border-orange-300 bg-orange-100",
                      )}
                    >
                      No info provided
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "text-sm text-gray-900 border w-full flex flex-col gap-3 whitespace-pre-wrap break-words p-4 rounded-lg",
                        data.type === "lead"
                          ? "border-green-300 bg-green-100"
                          : "border-orange-300 bg-orange-100",
                      )}
                    >
                      <span className="font-semibold">{data.subject}</span>
                      <span>{data.message || "No message provided"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
}
