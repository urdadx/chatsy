import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import BarList from "./bar-list";

interface ViewAllStatsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  allLinks: any[];
  maxTotalCount: number;
  name: string;
}

export function ViewAllStats({
  dialogOpen,
  name,
  setDialogOpen,
  allLinks,
  maxTotalCount,
}: ViewAllStatsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return allLinks;

    return allLinks.filter((link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allLinks]);

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setSearchQuery("");
    }
    setDialogOpen(open);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="w-[470px] max-h-[80vh] ">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg capitalize">All {name}</DialogTitle>
          <DialogDescription className="mb-2">
            View analytics for all {name}
          </DialogDescription>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="input-26"
                className="peer pe-9 ps-9 bg-background w-full"
                placeholder="Search links..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Submit search"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>
          </div>
        </DialogHeader>

        {filteredLinks.length > 0 ? (
          <BarList
            tab="Websites"
            unit="visits"
            data={filteredLinks}
            barBackground="bg-blue-200"
            hoverBackground="hover:bg-blue-50"
            maxValue={maxTotalCount}
            minBarWidth={5}
          />
        ) : (
          <div className="flex h-40 items-center justify-center text-gray-500">
            No links match your search
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
