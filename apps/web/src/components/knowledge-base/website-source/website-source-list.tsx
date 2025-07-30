import type { WebsiteSource } from "@/db/schema";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Spinner } from "../../ui/spinner";
import { EmptyState } from "./components/empty-state";
import { SourcesHeader } from "./components/sources-header";
import { SourcesList } from "./components/sources-list";
import { DeleteWebsiteSource } from "./delete-website-source";
import { useCrawlCompletion } from "./hooks/use-crawl-completion";
import { filterSources } from "./utils/website-source-utils";

export const WebsiteSourceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: queryData, isLoading } = useQuery<{
    success: boolean;
    data: WebsiteSource[];
  }>({
    queryKey: ["website-sources"],
    queryFn: async () => {
      const response = await api.get("/scrape");
      return response.data;
    },
    refetchInterval: 3000,
  });

  const sources = queryData?.data || [];

  // Handle crawl completion logic
  useCrawlCompletion(sources);

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

  const filteredSources = filterSources(sources, searchTerm);

  return (
    <div className="my-5 border  rounded-md p-6">
      <SourcesHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {filteredSources.length > 0 ? (
        <SourcesList
          sources={filteredSources}
          onDeleteClick={handleDeleteClick}
        />
      ) : (
        <EmptyState
          hasAllSources={sources.length > 0}
          hasFilteredSources={filteredSources.length > 0}
        />
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
