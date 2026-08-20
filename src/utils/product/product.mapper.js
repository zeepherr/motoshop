import { getR2PublicUrl } from "../../services/r2.storage.service.js";

export const toProductResponse = (product) => {
  const { imageKey, ...rest } = product;

  return {
    ...rest,

    imageUrl: imageKey ? getR2PublicUrl(imageKey) : null,
  };
};
