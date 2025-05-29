import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Edit, MoreVertical, Trash2 } from "lucide-react";

interface QuestionCardOptionsProps {
  questionId: string;
  isActive: boolean;
  onToggle: (id: string) => void;
}

export const QuestionCardOptions = ({
  questionId,
  isActive,
  onToggle,
}: QuestionCardOptionsProps) => {
  console.log(questionId, isActive, onToggle);
  return (
    <div className="flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none transition-opacity"
            aria-label="Open edit menu"
          >
            <MoreVertical size={14} strokeWidth={2} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit size={14} className="mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Archive size={14} className="mr-2" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive hover:text-destructive">
            <Trash2 size={14} className="mr-2 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
