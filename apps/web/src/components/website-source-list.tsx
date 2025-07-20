import type { WebsiteSource } from "@/db/schema";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
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
              className="border p-4 rounded-md flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{source.url}</p>
                <p className="text-muted-foreground text-sm">
                  Last crawled {new Date(source.createdAt).toLocaleDateString()}
                </p>
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
                  >
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
