const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function ensureUploadsDir(subdir) {
  // uploads/ lives at the repo root (sibling of Backend/)
  const dir = path.resolve(__dirname, "..", "..", "..", "uploads", subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function saveBase64File({ subdir, fileName, contentType, dataUrl }) {
  if (!subdir) {
    const err = new Error("Upload subdir is required");
    err.status = 500;
    throw err;
  }
  if (!dataUrl) {
    const err = new Error("No file data provided");
    err.status = 400;
    throw err;
  }

  const uploadsDir = ensureUploadsDir(subdir);
  const id = crypto.randomUUID();
  const ext = (fileName && path.extname(fileName)) || "";
  const safeName = `${id}${ext}`;
  const filePath = path.join(uploadsDir, safeName);

  const base64 = String(dataUrl).replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length > MAX_FILE_BYTES) {
    const err = new Error("File is too large. Maximum size is 5MB.");
    err.status = 413;
    throw err;
  }

  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${subdir}/${safeName}`,
    name: fileName || safeName,
    type: contentType || "application/octet-stream",
  };
}

module.exports = { saveBase64File };
