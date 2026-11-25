import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { mkdirSync } from "node:fs";
import { open, readdir, stat, unlink } from "node:fs/promises";

const dir = path.join(os.tmpdir(), "smng-audio-v2");
mkdirSync(dir, { recursive: true, mode: 0o700 });
const types = {
  ".wav": ["audio/wav", "audio/x-wav", "audio/wave"],
  ".mp3": ["audio/mpeg", "audio/mp3"],
  ".m4a": ["audio/mp4", "audio/x-m4a", "audio/m4a"],
};
export const MAX_BYTES = 25000000;
export async function deleteUploadedFile(file) {
  try {
    await unlink(file);
  } catch (error) {
    if (error.code !== "ENOENT")
      console.warn("Temporary audio cleanup deferred");
  }
}
// A crash can interrupt finally blocks. Sweep only server-generated filenames.
export async function sweepUploads() {
  for (const name of await readdir(dir)) {
    if (!/^[a-f0-9-]{36}\.(wav|mp3|m4a)$/.test(name)) continue;
    const file = path.join(dir, name);
    try {
      if ((await stat(file)).mtimeMs < Date.now() - 3600000)
        await deleteUploadedFile(file);
    } catch (error) {
      if (error.code !== "ENOENT") console.warn("Cleanup will retry");
    }
  }
}
const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_req, file, cb) =>
      cb(null, randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: MAX_BYTES + 1, files: 1, fields: 0, parts: 2 },
  fileFilter: (_req, file, cb) =>
    types[path.extname(file.originalname).toLowerCase()]?.includes(
      file.mimetype,
    )
      ? cb(null, true)
      : cb(new Error("Invalid audio format")),
}).single("audio");

export function matchesContainer(header, ext) {
  if (ext === ".wav")
    return (
      header.length >= 12 &&
      header.toString("ascii", 0, 4) === "RIFF" &&
      header.toString("ascii", 8, 12) === "WAVE"
    );
  if (ext === ".mp3")
    return (
      header.length >= 4 &&
      (header.toString("ascii", 0, 3) === "ID3" ||
        (header[0] === 255 && (header[1] & 224) === 224))
    );
  return (
    ext === ".m4a" &&
    header.length >= 12 &&
    header.toString("ascii", 4, 8) === "ftyp"
  );
}
export function uploadMiddleware(req, res, next) {
  upload(req, res, async (error) => {
    if (error || !req.file)
      return res
        .status(error?.code === "LIMIT_FILE_SIZE" ? 413 : 400)
        .json({
          error:
            error?.code === "LIMIT_FILE_SIZE"
              ? "Audio exceeds 25 MB"
              : "Provide one WAV, MP3 or M4A audio file",
        });
    const { path: file, size } = req.file;
    try {
      if (size > MAX_BYTES) {
        await deleteUploadedFile(file);
        return res.status(413).json({ error: "Audio exceeds 25 MB" });
      }
      const handle = await open(file, "r");
      const bytes = Buffer.alloc(16);
      let length;
      try {
        length = (await handle.read(bytes, 0, bytes.length, 0)).bytesRead;
      } finally {
        await handle.close();
      }
      if (!matchesContainer(bytes.subarray(0, length), path.extname(file))) {
        await deleteUploadedFile(file);
        return res
          .status(400)
          .json({ error: "Audio content does not match the selected format" });
      }
      next();
    } catch (failure) {
      await deleteUploadedFile(file);
      next(failure);
    }
  });
}
