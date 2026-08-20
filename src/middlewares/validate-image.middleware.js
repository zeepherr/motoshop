import createHttpError from "http-errors";

import { fileTypeFromBuffer } from "file-type";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const validateImage = async (req, res, next) => {
  if (!req.file) {
    // const error = createHttpError(400, "Image is required.", {
    //   code: "IMAGE_REQUIRED",
    // });
    // return next(error);//image is an optional at this time
    return next();
  }
  const detectedType = await fileTypeFromBuffer(req.file.buffer); //this will get buffer and return with ext:"jpg",and mime:"image/jpeg"
  if (
    !detectedType ||
    !allowedImageTypes.has(
      detectedType.mime || detectedType.mime !== req.file.mimetype,
    )
  ) {
    const error = createHttpError(
      415,
      "Only JPEG, PNG, and WebP images are allowed",
      {
        code: "UNSUPPORTED_IMAGE_TYPE",
      },
    );
    return next(error);
  }
  req.file.detectedType = detectedType;
  next();
};
