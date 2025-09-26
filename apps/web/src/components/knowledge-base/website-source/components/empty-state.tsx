interface EmptyStateProps {
  hasAllSources: boolean;
  hasFilteredSources: boolean;
}

export const EmptyState = ({
  hasAllSources,
  hasFilteredSources,
}: EmptyStateProps) => {
  return (
    <div className="text-muted-foreground text-center">
      {hasAllSources && !hasFilteredSources
        ? "No matching sources found."
        : "No link sources found."}
    </div>
  );
};
