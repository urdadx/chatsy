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

export const uploadFileToStorage = async (
  file: { originalname: string; mimetype: any; buffer: any },
  folderPath = "",
) => {
  if (!file) throw new Error("No file provided");

  const timestamp = Date.now();
  const safeFilename = file.originalname
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
  const newFileName = `${folderPath}${timestamp}_${safeFilename}`;

  const fileUpload = bucket.file(newFileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);

    stream.on("finish", async () => {
      try {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    stream.end(file.buffer);
  });
};
