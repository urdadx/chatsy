import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Edit, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteTextSource } from "./playground/text-source/delete-text-source";
import { EditTextSource } from "./playground/text-source/edit-text-source";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SearchInput } from "./ui/search-input";
import { Spinner } from "./ui/spinner";

interface TextSource {
  id: string;
  title: string;
  content: string;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export const TextSourceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTextSource, setEditingTextSource] = useState<TextSource | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: textSources, isLoading } = useQuery<TextSource[]>({
    queryKey: ["text-sources"],
    queryFn: async () => {
      const response = await api.get("/text-sources");
      return response.data;
    },
  });

  const [deletingTextSourceId, setDeletingTextSourceId] = useState<
    string | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeletingTextSourceId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (textSource: TextSource) => {
    setEditingTextSource(textSource);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="my-8 flex justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!textSources || textSources.length === 0) {
    return null;
  }

  const filteredTextSources = textSources.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="my-5 border rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Text Sources</h3>
          <SearchInput
            placeholder="Search text sources..."
            value={searchTerm}
            onSearchChange={setSearchTerm}
            className="w-auto"
          />
        </div>
        {filteredTextSources.length > 0 ? (
          <div className="space-y-4">
            {filteredTextSources.map((ts) => (
              <div
                key={ts.id}
                className="border p-4 rounded-md flex justify-between items-start"
              >
                <div className="flex flex-row gap-3 items-center">
                  <div className="bg-gray-100 rounded-full p-2">
                    <FileText className="h-5 w-5 text-primary/70" />
                  </div>{" "}
                  <div>
                    <p className="text-sm">{ts.title}</p>
                    <p className="text-muted-foreground text-xs">
                      Last updated {timeAgo(ts.updatedAt)}
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
                    <DropdownMenuItem onClick={() => handleEdit(ts)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => handleDeleteClick(ts.id)}
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
            No matching text sources found.
          </div>
        )}

        {editingTextSource && (
          <EditTextSource
            textSource={editingTextSource}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}

        {deletingTextSourceId && (
          <DeleteTextSource
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            id={deletingTextSourceId}
          />
        )}
      </div>
    </>
  );
};
