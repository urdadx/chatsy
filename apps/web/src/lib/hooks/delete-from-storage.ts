import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: "nomad-23595",
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID!,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID!,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    universe_domain: "googleapis.com",
  },
});

const bucket = storage.bucket("nomad-23595.appspot.com");

export const deleteFileFromStorage = async (fileUrl: string) => {
  if (!fileUrl) throw new Error("No file URL provided");

  try {
    const url = new URL(fileUrl);
    const pathname = url.pathname;
    // We want: padyna/rag-documents/filename.pdf
    const pathParts = pathname.substring(1).split("/");

    if (pathParts.length < 2 || pathParts[0] !== bucket.name) {
      throw new Error("Invalid file URL format");
    }

    // Join all parts except the first one (bucket name)
    const filename = pathParts.slice(1).join("/");

    if (!filename) {
      throw new Error("Could not extract filename from URL");
    }

    const file = bucket.file(filename);

    const [exists] = await file.exists();

    if (!exists) {
      console.warn(`File ${filename} does not exist in storage`);
      return false;
    }

    await file.delete();
    console.log(`File ${filename} deleted successfully from storage`);
    return true;
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    throw error;
  }
};
