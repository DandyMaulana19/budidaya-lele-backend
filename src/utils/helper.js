import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadDir = (dir = "") => {
  return path.join(__dirname, "..", "uploads", dir);
};

export const ensureUploadDir = async (dir = "") => {
  const dirPath = uploadDir(dir);
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
};

export const generateUploadPath = async (
  originalFilename = "",
  subdir = "feed-reports",
  mimetype = null
) => {
  const dirPath = await ensureUploadDir(subdir);

  let ext = path.extname(originalFilename);
  if (!ext) {
    const map = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/heic": ".heic",
      "image/heif": ".heic",
    };
    ext = (mimetype && map[mimetype]) || ".jpg";
  }

  const filename = `${randomUUID()}${ext}`;
  const filePath = path.join(dirPath, filename);
  const urlPath = `/src/uploads/${subdir}/${filename}`;

  return { filePath, urlPath };
};
