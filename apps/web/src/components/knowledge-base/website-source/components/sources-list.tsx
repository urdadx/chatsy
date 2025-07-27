import type { WebsiteSource } from "@/db/schema";
import { SourceItem } from "./source-item";

interface SourcesListProps {
  sources: WebsiteSource[];
  onDeleteClick: (id: string) => void;
}

export const SourcesList = ({ sources, onDeleteClick }: SourcesListProps) => {
  if (sources.length === 0) {
    return (
      <div className="text-muted-foreground">No website sources found.</div>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <SourceItem
          key={source.id}
          source={source}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};
