import type { WebsiteSource } from "@/db/schema";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Globe, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteWebsiteSource } from "./delete-website-source";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SearchInput } from "./ui/search-input";
import { Spinner } from "./ui/spinner";

export const WebsiteSourceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: queryData, isLoading } = useQuery<{
    success: boolean;
    data: WebsiteSource[];
  }>({
    queryKey: ["websiteSources"],
    queryFn: async () => {
      const response = await api.get("/scrape");
      return response.data;
    },
  });

  const sources = queryData?.data || [];

  const handleDeleteClick = (id: string) => {
    setDeletingSourceId(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="my-8 flex justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  const filteredSources = sources.filter((s) =>
    s.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="my-5 border rounded-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Website Sources</h3>
        <SearchInput
          placeholder="Search sources..."
          value={searchTerm}
          onSearchChange={setSearchTerm}
          className="w-auto"
        />
      </div>
      {filteredSources.length > 0 ? (
        <div className="space-y-4">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="border p-3 rounded-md flex justify-between items-start"
            >
              <div className="flex flex-row gap-3 items-center">
                <div className="bg-gray-100 rounded-full p-2">
                  <Globe className="h-5 w-5 text-primary/70" />
                </div>
                <div>
                  <p className="text-sm">{source.url}</p>
                  <p className="text-muted-foreground text-xs">
                    Last crawled {timeAgo(source.updatedAt)}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => handleDeleteClick(source.id)}
                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground">
          {sources.length > 0
            ? "No matching sources found."
            : "No website sources found."}
        </div>
      )}

      {deletingSourceId && (
        <DeleteWebsiteSource
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          id={deletingSourceId}
        />
      )}
    </div>
  );
};
