import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import AppError from "../AppError.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFor(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

function safeExt(originalName: string, mimeType: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName === ".jpg" || fromName === ".jpeg") return ".jpg";
  if (fromName === ".png") return ".png";
  if (fromName === ".webp") return ".webp";
  if (fromName === ".gif") return ".gif";
  return extensionFor(mimeType) || ".bin";
}

const uploadsRoot = path.join(process.cwd(), "uploads");
const productUploadsDir = path.join(uploadsRoot, "products");

const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(productUploadsDir, { recursive: true });
      cb(null, productUploadsDir);
    } catch (err) {
      cb(err as Error, productUploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const productId = String((req.params as any)?.id ?? "unknown").replace(/[^0-9]/g, "") || "unknown";
    const ext = safeExt(file.originalname, file.mimetype);
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `product-${productId}-${unique}${ext}`);
  }
});

const productImageUploadInner = multer({
  storage: productImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new AppError("Only image files are allowed (jpg, png, webp, gif).", 400));
    }
    cb(null, true);
  }
}).single("image");

export function productImageUpload(req: Request, res: Response, next: NextFunction) {
  productImageUploadInner(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return next(new AppError("Image is too large (max 5MB).", 400));
      return next(new AppError(err.message, 400));
    }

    next(err);
  });
}

