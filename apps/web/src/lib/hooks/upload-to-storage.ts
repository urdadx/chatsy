import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Storage } from "@google-cloud/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = new Storage({
  projectId: "nomad-23595",
  keyFilename: path.join(__dirname, "../../../padyna-service-keys.json"),
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
