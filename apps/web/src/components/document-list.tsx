import DocxIcon from "@/assets/docx-icon.png";
import PDFIcon from "@/assets/pdf-icon.png";
import TXTIcon from "@/assets/txt-icon.png";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/hooks/use-file-upload";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

const getFileIcon = (file: { type: string; name: string }) => {
  const { type, name } = file;

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return <img src={PDFIcon} alt="PDF Icon" className="size-10 " />;
  }

  if (name.endsWith(".txt") || type.includes("text")) {
    return <img src={TXTIcon} alt="PDF Icon" className="size-10 " />;
  }

  if (
    type.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return <img src={DocxIcon} alt="PDF Icon" className="size-10 " />;
  }

  return <img src={PDFIcon} alt="PDF Icon" className="size-10 " />;
};

export function DocumentList() {
  const queryClient = useQueryClient();

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["document-sources"],
    queryFn: async () => {
      const res = await api.get("/document-source");
      return res.data as {
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
      }[];
    },
    initialData: [],
  });

  const { mutate: deleteDocumentSource, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => {
      return api.delete("/document-source", { data: { id } });
    },
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["document-sources"] });
    },
    onError: () => {
      toast.error("Failed to delete document.");
    },
  });

  if (isLoadingDocuments) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <p className="font-semibold text-lg">
        {documents.length === 0 ? "" : "File sources"}
      </p>
      {documents.length > 0 && (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-background flex items-center justify-between gap-2 rounded-md border p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {getFileIcon({ type: doc.type, name: doc.name })}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatBytes(doc.size)}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:text-red-400 -me-2 size-8 hover:bg-transparent"
                onClick={() => deleteDocumentSource(doc.id)}
                aria-label="Remove file"
                disabled={isDeleting}
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
