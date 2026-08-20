import { randomUUID } from "node:crypto";

import { Router } from "express";

import { upload } from "../../middlewares/upload.middleware.js";
import { validateImage } from "../../middlewares/validate-image.middleware.js";
import { uploadToR2 } from "../../services/r2.storage.service.js";

const router = Router();

router.post(
  "/",
  upload.single("image"),
  validateImage,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Image is required.",
        });
      }

      const extension = req.file.detectedType.ext;

      const key = `test/${randomUUID()}${extension}`;

      const uploadedImage = await uploadToR2({
        buffer: req.file.buffer,
        key,
        contentType: req.file.detectedType.mime,
      });

      res.status(201).json({
        message: "Image uploaded successfully.",
        image: {
          key: uploadedImage.key,
          url: uploadedImage.url,
          contentType: req.file.detectedType.mime,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
