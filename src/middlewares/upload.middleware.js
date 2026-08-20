import createHttpError from "http-errors";
import multer from "multer";
import { MAX_IMAGE_SIZE } from "../constant/upload.constant.js";

const storage = multer.memoryStorage();

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const imageFileFilter = (req, file, next) => {
  if (!allowedImageTypes.has(file.mimetype)) {
    const error = createHttpError(
      415,
      "Only JPEG, PNG, and WebP images are allowed.",
    );
    error.code = "UNSUPPORTED_IMAGE_TYPE";
    return next(error);
  }
  next(null, true);
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
});
