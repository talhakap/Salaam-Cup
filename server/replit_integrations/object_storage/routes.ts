import type { Express } from "express";
import { isAuthenticated } from "../auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import express from "express";

const UPLOADS_BASE = path.resolve(process.cwd(), "attached_assets", "uploads");
const ALLOWED_FOLDERS = ["news", "tournaments", "sponsors", "media", "special-awards", "about", "teams"];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const folder = (req.query?.folder || req.body?.folder || "general") as string;
      const sanitizedFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "general";
      const dest = path.join(UPLOADS_BASE, sanitizedFolder);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.use("/uploads", express.static(UPLOADS_BASE));

  app.post("/api/uploads/file", isAuthenticated, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ error: "Upload failed" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const relativePath = path.relative(UPLOADS_BASE, file.path);
      const servePath = `/uploads/${relativePath.replace(/\\/g, "/")}`;

      res.json({
        objectPath: servePath,
        metadata: {
          name: file.originalname,
          size: file.size,
          contentType: file.mimetype,
        },
      });
    });
  });

  app.post("/api/uploads/request-url", isAuthenticated, async (req, res) => {
    try {
      const { name, size, contentType, folder } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      const sanitizedFolder = folder && ALLOWED_FOLDERS.includes(folder) ? folder : "general";

      const uploadURL = await objectStorageService.getObjectEntityUploadURL(sanitizedFolder);
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.use("/objects", async (req, res, next) => {
    if (req.method !== "GET") return next();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.originalUrl);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      console.error("Error serving object:", error);
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
