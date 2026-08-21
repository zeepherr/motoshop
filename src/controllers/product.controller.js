import createHttpError from "http-errors";
import { randomUUID } from "node:crypto";
import { findCategoryBy } from "../services/category.service.js";
import { countProductOrderItems } from "../services/orderItem.service.js";
import {
  addProduct,
  findAllProducts,
  findProductBy,
  findProductByAdmin,
  removeProduct,
  setProduct,
} from "../services/product.service.js";
import { deleteFromR2, uploadToR2 } from "../services/r2.storage.service.js";
import { generateSku } from "../utils/jwt.util.js";
import { toProductResponse } from "../utils/product/product.mapper.js";
import { paramId } from "../validations/general.schema.js";
import {
  createProductSchema,
  updateProductSehcma,
} from "../validations/product.schema.js";
import { prisma } from "../lib/primsa.js";
//find
export const getAllProduct = async (req, res, next) => {
  const products = await findAllProducts({ isActive: true });
  if (products.length === 0) {
    return res.status(204).json({
      messsage: "No available found.",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all available products",
    data: products.map(toProductResponse),
  });
};

export const getAllProductAdmin = async (req, res, next) => {
  const products = await findAllProducts();
  if (products.length === 0) {
    return res.status(204).json({
      messsage: "No available found.",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all available products",
    data: products.map(toProductResponse),
  });
};

export const getProductBy = async (req, res, next) => {
  const { id } = paramId.parse(req.params);
  const haveProduct = await findProductBy("id", id);
  if (!haveProduct)
    return next(createHttpError(404, "This product is not available."));
  return res.status(200).json({
    success: true,
    message: "Get a product successfully",
    data: toProductResponse(haveProduct),
  });
};




//create
export const createProduct = async (req, res, next) => {
  const data = createProductSchema.parse(req.body);
  if (data.sku) {
    const havesku = await findProductBy("sku", data.sku);
    if (havesku) {
      return next(createHttpError(409, "This SKU is already exist."));
    }
  }
  if (!data.sku) {
    data.sku = generateSku(data.name);
  }
  const catExist = await findCategoryBy("id", data.productCategoryId);
  if (!catExist)
    return next(createHttpError(400, "The given category is not found."));
  let imageKey = null;
  if (req.file) {
    const key = `products/${randomUUID()}.${req.file.detectedType.ext}`;
    const uploadedImage = await uploadToR2({
      buffer: req.file.buffer,
      key,
      contentType: req.file.detectedType.mime,
    });
    imageKey = uploadedImage.key;
  }
  let newProduct;
  try {
    newProduct = await addProduct({ ...data, imageKey });
  } catch (err) {
    //if not success delect image as well
    if (imageKey) {
      try {
        await deleteFromR2(imageKey);
      } catch (error) {
        console.error(error);
      }
    }
    return next(err);
  }
  res.status(201).json({
    success: true,
    message: "A product is added",
    data: toProductResponse(newProduct),
  });
};

//update
export const updateProduct = async (req, res, next) => {
  const { id } = paramId.parse(req.params);
  const haveProduct = await findProductByAdmin("id", id);
  if (!haveProduct)
    return next(createHttpError(404, "This product is not exist."));
  const data = updateProductSehcma.parse(req.body);
  if (Object.keys(data).length === 0 && !req.file) {
    return next(createHttpError(400, "No changes were provided."));
  }
  if (data.sku && data.sku !== haveProduct.sku) {
    const haveSku = await findProductByAdmin("sku", data.sku);
    if (haveSku) return next(createHttpError(409, "This SKU is already exist"));
  }
  if (data.productCategoryId !== undefined) {
    const catExist = await findCategoryBy("id", data.productCategoryId);
    if (!catExist)
      return next(createHttpError(400, "The given category is not found."));
  }
  let newImageKey = null;
  if (req.file) {
    const key = `products/${randomUUID()}.${req.file.detectedType.ext}`;

    const uploadedImage = await uploadToR2({
      buffer: req.file.buffer,
      key,
      contentType: req.file.detectedType.mime,
    });
    newImageKey = uploadedImage.key;
  }
  const updatedData = {
    ...data,
    ...(newImageKey && { imageKey: newImageKey }),
  };
  //to catch if no success
  let updated;
  try {
    updated = await setProduct(id, updatedData);
  } catch (err) {
    if (newImageKey) {
      try {
        await deleteFromR2(newImageKey);
      } catch (cleanupError) {
        // return next(createHttpError(400, "Failed to clean up new R2 image"));
        console.error(cleanupError);
      }
    }
    return next(err);
  }
  //if success clean old image

  if (newImageKey && haveProduct.imageKey) {
    try {
      await deleteFromR2(haveProduct.imageKey);
    } catch (err) {
      console.error(err);
    }
  }

  res.status(200).json({
    success: true,
    message: "Updated successfully.",
    data: toProductResponse(updated),
  });
};


//delete
//review later
export const deleteProduct = async (req, res, next) => {
  const { id } = paramId.parse(req.params);
  const haveProduct = await findProductByAdmin("id", id);
  if (!haveProduct)
    return next(createHttpError(404, "This product is not exist."));
  const orderItemCount = await countProductOrderItems(id);

  if (orderItemCount > 0) {
    const error = createHttpError(
      409,
      "This product has order history and cannot be deleted. Deactivate it instead.",
    );

    error.code = "PRODUCT_HAS_ORDER_HISTORY";

    return next(error);
  }
  await removeProduct(id);

  if (haveProduct.imageKey) {
    try {
      await deleteFromR2(haveProduct.imageKey);
    } catch (err) {
      console.error(err);
    }
  }
  res.status(200).json({
    success: true,
    message: "Deletd successfully",
    data: null,
  });
};


