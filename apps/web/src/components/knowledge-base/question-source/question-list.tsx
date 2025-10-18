import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { RiQuestionFill } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteQuestion } from "../../playground/questions/delete-question";
import { EditQuestion } from "../../playground/questions/edit-questions";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { SearchInput } from "../../ui/search-input";
import Spinner from "../../ui/spinner";

interface Question {
  id: string;
  question: string;
  answer: string;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export const QuestionList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await api.get("/questions");
      return response.data;
    },
  });

  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeletingQuestionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="my-8 flex justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="my-5 border rounded-xl p-4 sm:p-6">
      <div className="flex justify-between gap-4 items-center mb-4">
        <h3 className="font-semibold text-lg hidden sm:block">Questions</h3>
        <SearchInput
          placeholder="Search questions..."
          value={searchTerm}
          onSearchChange={setSearchTerm}
          className="w-auto"
        />
      </div>
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="border p-4 rounded-lg flex justify-between items-start"
            >
              <div className="flex flex-row gap-3 items-center">
                <div className="bg-gray-100 rounded-full p-2">
                  <RiQuestionFill className="h-7 w-7 text-primary/60" />
                </div>
                <div>
                  <p className=" text-sm">{q.question}</p>
                  <p className="text-muted-foreground text-xs">
                    Last updated {timeAgo(q.updatedAt)}
                  </p>
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
                  <DropdownMenuItem onClick={() => handleEdit(q)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => handleDeleteClick(q.id)}
                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground">
          No matching questions found.
        </div>
      )}

      {editingQuestion && (
        <EditQuestion
          question={editingQuestion}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {deletingQuestionId && (
        <DeleteQuestion
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          id={deletingQuestionId}
        />
      )}
    </div>
  );
};
