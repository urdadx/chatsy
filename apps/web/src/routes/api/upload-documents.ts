import { uploadFileToStorage } from "@/lib/upload-to-storage";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

async function parseFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("File type not allowed");
  }

  return file;
}

async function fileToBuffer(file: File): Promise<Buffer> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

export const ServerRoute = createServerFileRoute(
  "/api/upload-documents",
).methods({
  POST: async ({ request }) => {
    try {
      const file = await parseFormData(request);
      const buffer = await fileToBuffer(file);

      const uploadedUrl = await uploadFileToStorage(
        {
          buffer,
          originalname: file.name,
          mimetype: file.type,
        },
        "chatsy/rag-documents/",
      );

      return json({ url: uploadedUrl });
    } catch (error) {
      console.error("Upload error:", error);

      if (error instanceof Error) {
        return json({ error: error.message }, { status: 400 });
      }

      return json({ error: "Failed to upload file" }, { status: 500 });
    }
  },
});
