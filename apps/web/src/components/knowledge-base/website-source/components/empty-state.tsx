import type { WebsiteSource } from "@/db/schema";

interface EmptyStateProps {
  hasAllSources: boolean;
  hasFilteredSources: boolean;
}

export const EmptyState = ({
  hasAllSources,
  hasFilteredSources,
}: EmptyStateProps) => {
  return (
    <div className="text-muted-foreground">
      {hasAllSources && !hasFilteredSources
        ? "No matching sources found."
        : "No website sources found."}
    </div>
  );
};
