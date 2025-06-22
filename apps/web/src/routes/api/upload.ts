import { uploadImageToStorage } from "@/lib/upload-to-storage";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

async function parseFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
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

export const APIRoute = createAPIFileRoute("/api/upload")({
  POST: async ({ request }) => {
    try {
      const file = await parseFormData(request);
      const buffer = await fileToBuffer(file);

      const uploadedUrl = await uploadImageToStorage(
        {
          buffer,
          originalname: file.name,
          mimetype: file.type,
        },
        "chatsy/products/",
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
