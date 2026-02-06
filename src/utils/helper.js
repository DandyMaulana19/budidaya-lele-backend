import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { promises } from "fs";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadDir = (dir = "") => {
  return path.join(__dirname, "..", "uploads", dir);
};

export const ensureUploadDir = async (dir = "") => {
  const dirPath = uploadDir(dir);
  await promises.mkdir(dirPath, { recursive: true });
  return dirPath;
};

export const ensureLogDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const generateUploadPath = async (
  originalFilename = "",
  subdir = "feed-reports",
  mimetype = null,
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

const wibTimezone = (date) => {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().replace("Z", "+07:00");
};

export const writeNodeLog = ({ node_id, ph, temp, createdAt }) => {
  const nodeId = String(node_id);
  const date = createdAt.toISOString().split("T")[0];

  const baseDir = path.join(process.cwd(), "/src/.logs");
  const nodeDir = path.join(baseDir, `kolam-${nodeId}`);

  ensureLogDir(nodeDir);

  const filePath = path.join(nodeDir, `${date}.log`);

  const logData = {
    node_id: nodeId,
    ph,
    temp,
    createdAt: wibTimezone(createdAt),
  };

  fs.appendFileSync(filePath, JSON.stringify(logData) + "\n");
};

export const readLogFile = async (filePath) => {
  try {
    const content = await promises.readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    console.warn(`Failed to read file ${filePath}:`, error.message);
    return [];
  }
};

export const getLogs = async ({ kolam = "0", startDate, endDate }) => {
  const baseDir = path.resolve("src/.logs");

  //   const kolamFolders =
  //     kolam === "0" ? await promises.readdir(baseDir) : [`kolam-${kolam}`];

  //   const today = dayjs();
  //   let startDate, endDate;
  //   const end = today.endOf("day");
  //   switch (range) {
  //     case "week":
  //       startDate = today.subtract(6, "day").startOf("day");
  //       break;
  //     case "month":
  //       startDate = today.subtract(29, "day").startOf("day");
  //       break;
  //     default:
  //       startDate = today.startOf("day");
  //   }

  //   const datesToRead = [];
  //   for (
  //     let d = startDate;
  //     d.isBefore(end) || d.isSame(end, "day");
  //     d = d.add(1, "day")
  //   ) {
  //     datesToRead.push(d.format("YYYY-MM-DD"));
  //   }

  //   const allLogs = [];

  //   for (const k of kolamFolders) {
  //     for (const date of datesToRead) {
  //       const filePath = path.join(baseDir, k, `${date}.log`);
  //       const logs = await readLogFile(filePath);
  //       allLogs.push(...logs);
  //     }
  //   }

  //   return allLogs;

  const kolamFolders =
    kolam === "0" ? await promises.readdir(baseDir) : [`kolam-${kolam}`];

  const start = dayjs(startDate).startOf("day");
  const end = dayjs(endDate).endOf("day");

  if (!start.isValid() || !end.isValid()) {
    throw new Error("Format tanggal tidak valid (YYYY-MM-DD)");
  }

  const datesToRead = [];
  for (
    let d = start;
    d.isBefore(end) || d.isSame(end, "day");
    d = d.add(1, "day")
  ) {
    datesToRead.push(d.format("YYYY-MM-DD"));
  }

  const allLogs = [];

  for (const k of kolamFolders) {
    for (const date of datesToRead) {
      const filePath = path.join(baseDir, k, `${date}.log`);
      const logs = await readLogFile(filePath);
      allLogs.push(...logs);
    }
  }

  return allLogs;
};
