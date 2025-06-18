import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteQuestion } from "./delete-question";
import { EditQuestion } from "./edit-questions";

export const QuestionCardOptions = ({ question }: { question: any }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleEdit = () => {
    setOpenEdit(true);
  };

  const handleDelete = () => {
    setOpenDelete(true);
  };

  return (
    <>
      <EditQuestion
        question={question}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />
      <DeleteQuestion
        id={question.id}
        open={openDelete}
        onOpenChange={setOpenDelete}
      />
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className=""
              aria-label="Open edit menu"
            >
              <MoreVertical size={14} strokeWidth={2} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleDelete}>
              <Trash2
                size={14}
                className="mr-2 text-destructive hover:text-text-red-400"
              />
              <span className="text-destructive hover:text-red-500">
                Delete
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
