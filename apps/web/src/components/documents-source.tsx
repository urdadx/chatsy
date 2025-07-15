import {
  AlertCircleIcon,
  FileIcon,
  FileTextIcon,
  FileUpIcon,
  HammerIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
    return <FileTextIcon className="size-4 opacity-60 text-red-500" />;
  }

  if (fileName.endsWith(".txt") || fileType.includes("text")) {
    return <FileIcon className="size-4 opacity-60 text-blue-500" />;
  }

  if (
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <FileTextIcon className="size-4 opacity-60 text-blue-600" />;
  }

  return <FileIcon className="size-4 opacity-60" />;
};

export function DocumentSource() {
  const maxSize = 100 * 1024 * 1024; // 10MB default
  const maxFiles = 10;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    accept: ".pdf,.docx,.doc,.txt",
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col gap-2 mb-3">
          <h2 className="font-semibold text-lg">Files</h2>
          <p className=" text-semibold text-base text-muted-foreground">
            Upload and manage various documents to train your AI agent
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger>
            <Button disabled>
              <HammerIcon />
              Start training
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white shadow-sm">
            <p className="text-sm text-black">
              Add a website URL first to start crawling its content.
            </p>
          </TooltipContent>
        </Tooltip>
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
          className="border-input border-2 bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-64 flex-col items-center justify-center rounded-xl  border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload files"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="bg-background mb-2 flex size-16 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <FileUpIcon className="size-6 opacity-60" />
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

        {/* File list */}
        <p className="font-semibold text-lg py-2">
          {files.length === 0 ? "" : `Uploaded files (${files.length})`}
        </p>
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.file instanceof File
                        ? file.file.name
                        : file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(
                        file.file instanceof File
                          ? file.file.size
                          : file.file.size,
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-400 -me-2 size-8 hover:bg-transparent"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}

            {/* Remove all files button */}
            {files.length > 1 && (
              <div>
                <Button
                  className="text-red-500 hover:text-red-500"
                  variant="outline"
                  onClick={clearFiles}
                >
                  <Trash2Icon className="size-4 text-red-500" />
                  Remove all files
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
