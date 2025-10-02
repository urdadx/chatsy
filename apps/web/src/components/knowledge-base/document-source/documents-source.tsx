import { SolarUploadBoldDuotone } from "@/assets/icons/upload";
import { useRetrainingBanner } from "@/components/retraining-banner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { DocumentList } from "./document-list";

export function DocumentSource() {
  const maxSize = 100 * 1024 * 1024;
  const maxFiles = 10;
  const queryClient = useQueryClient();
  const { setBanner } = useRetrainingBanner();

  const { mutateAsync: uploadAndCreateDocument, isPending: isUploading } =
    useMutation({
      mutationFn: async (file: any) => {
        const formData = new FormData();
        formData.append("file", file.file as File);
        const uploadResponse = await api.post("/upload-documents", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { name, type, size } = file.file;
        const { url } = uploadResponse.data;

        await api.post("/document-source", {
          name,
          type,
          size,
          url,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["document-sources"] });
        setBanner(true, "Retraining required");
      },
    });

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop: originalHandleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    accept: ".pdf,.docx,.doc,.txt",
  });

  const handleDrop = (e: React.DragEvent) => {
    originalHandleDrop(e as React.DragEvent<HTMLElement>);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((file) => {
      const fileObj = { id: Date.now().toString(), file };
      toast.promise(uploadAndCreateDocument(fileObj), {
        loading: "Uploading document...",
        success: "Document uploaded and is now processing!",
        error: "Failed to upload document.",
      });
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        const fileObj = { id: Date.now().toString(), file };
        toast.promise(uploadAndCreateDocument(fileObj), {
          loading: "Uploading document...",
          success: "Document uploaded and is now processing!",
          error: "Failed to upload document.",
        });
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 rounded-3xl p-5 border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Files</h2>
            <p className=" text-semibold text-base text-muted-foreground">
              Upload and manage various documents to train your AI agent
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {/* Drop area */}
          {/* biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
          <div
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="button"
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            className={cn(
              "border-input border-2 bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-52 flex-col items-center justify-center rounded-xl border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px] hover:border-primary",
              isDragging && "border-primary",
            )}
          >
            <input
              {...getInputProps()}
              onChange={handleFileSelect}
              className="sr-only"
              aria-label="Upload files"
              disabled={isUploading}
            />

            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="bg-white mb-2 flex size-16 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <SolarUploadBoldDuotone className="size-8" />
              </div>
              <p className="mb-1.5 text-base font-medium">Upload files</p>
              <p className="text-muted-foreground mb-2 text-sm">
                Drag & drop or click to browse
              </p>
              <div className="text-muted-foreground/70 flex flex-wrap justify-center gap-1 text-sm">
                <span>Supported File Types: .pdf, .docx, .doc, .txt </span>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div
              className="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <AlertCircleIcon className="size-3 shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>
      </div>
      {/* File list */}

      <DocumentList />
    </>
  );
}
