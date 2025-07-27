import { SearchInput } from "../../../ui/search-input";

interface SourcesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SourcesHeader = ({
  searchTerm,
  onSearchChange,
}: SourcesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-lg">Website Sources</h3>
      <SearchInput
        placeholder="Search sources..."
        value={searchTerm}
        onSearchChange={onSearchChange}
        className="w-auto"
      />
    </div>
  );
};
