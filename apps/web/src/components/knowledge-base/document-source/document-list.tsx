import DocxIcon from "@/assets/docx-icon.png";
import PDFIcon from "@/assets/pdf-icon.png";
import TXTIcon from "@/assets/txt-icon.png";
import { useRetrainingBanner } from "@/components/retraining-banner";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/hooks/use-file-upload";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

const getFileIcon = (file: { type: string; name: string }) => {
  const { type, name } = file;

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return <img src={PDFIcon} alt="PDF Icon" className="size-8 " />;
  }

  if (name.endsWith(".txt") || type.includes("text")) {
    return <img src={TXTIcon} alt="PDF Icon" className="size-8 " />;
  }

  if (
    type.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return <img src={DocxIcon} alt="PDF Icon" className="size-8 " />;
  }

  return <img src={PDFIcon} alt="PDF Icon" className="size-8 " />;
};

export function DocumentList() {
  const queryClient = useQueryClient();
  const { setBanner } = useRetrainingBanner();

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

  const { mutateAsync: deleteDocumentSource, isPending: isDeleting } = useMutation({
    mutationFn: async (doc: { id: string; url: string }) => {
      await api.delete("/document-source", { data: { id: doc.id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-sources"] });
      setBanner(true, "Retraining required");
      localStorage.setItem("lastTrainedAt", new Date().toISOString());
    },

  });

  if (isLoadingDocuments) {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 className="size-4 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">
          Loading documents...
        </span>
      </div>
    );
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
              className="bg-background flex items-center justify-between gap-2 rounded-2xl border p-2 pe-3"
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
                onClick={() =>
                  toast.promise(deleteDocumentSource({ id: doc.id, url: doc.url }), {
                    loading: "Deleting document...",
                    success: "Document deleted",
                    error: "Error deleting document",
                  })
                }
                aria-label="Remove file"
                disabled={isDeleting}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
