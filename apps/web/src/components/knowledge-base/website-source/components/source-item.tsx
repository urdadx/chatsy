import type { WebsiteSource } from "@/db/schema";
import { timeAgo } from "@/lib/utils";
import { Globe, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { truncateUrl } from "../utils/website-source-utils";

interface SourceItemProps {
  source: WebsiteSource;
  onDeleteClick: (id: string) => void;
}

export const SourceItem = ({ source, onDeleteClick }: SourceItemProps) => {
  return (
    <div className="border p-3 rounded-md flex justify-between items-start">
      <div className="flex flex-row gap-3 items-center">
        <div className="bg-gray-100 rounded-full p-2">
          <Globe className="h-5 w-5 text-primary/70" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm" title={source.url}>
              {truncateUrl(source.url)}
            </p>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                source.type === "crawl"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {source.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span>Last crawled {timeAgo(source.updatedAt)}</span>
          </div>
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
            onClick={() => onDeleteClick(source.id)}
            className="text-red-500 hover:text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
