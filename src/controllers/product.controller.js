import createHttpError from "http-errors";
import { findCategoryBy } from "../services/category.service.js";
import {
  addProduct,
  findAllProducts,
  findProductBy,
  findProductByAdmin,
  removeProduct,
  setProduct,
} from "../services/product.service.js";
import { generateSku } from "../utils/jwt.util.js";
import { paramId } from "../validations/general.schema.js";
import {
  createProductSchema,
  updateProductSehcma,
} from "../validations/product.schema.js";

export const getAllProduct = async (req, res, next) => {
  const products = await findAllProducts({ isActive: true });
  if (products.length === 0) {
    return res.status(200).json({
      messsage: "No available found.",
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all available products",
    product: products,
  });
};

export const getAllProductAdmin = async (req, res, next) => {
  const products = await findAllProducts();
  if (products.length === 0) {
    return res.status(200).json({
      messsage: "No available found.",
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all available products",
    product: products,
  });
};

export const getProductBy = async (req, res, next) => {
  const { id } = paramId.parse(req.params);
  const haveProduct = await findProductBy("id", id);
  if (!haveProduct)
    return next(createHttpError(404, "This product is not exist."));
  return res.status(200).json({
    success: true,
    message: "Get a product successfully",
    product: haveProduct,
  });
};

export const createProduct = async (req, res, next) => {
  const data = createProductSchema.parse(req.body);
  const catExist = await findCategoryBy("id", data.productCategoryId);
  if (!catExist)
    return next(createHttpError(400, "The given category is not found."));
  if (data.sku) {
    const havesku = await findProductBy("sku", data.sku);
    if (havesku) {
      return next(createHttpError(409, "This SKU is already exist."));
    }
  }
  if (!data.sku) {
    data.sku = generateSku(data.name);
  }

  const newProduct = await addProduct(data);
  res.status(201).json({
    success: true,
    message: "A product is added",
    pruduct: newProduct,
  });
};

export const updateProduct = async (req, res, next) => {
  const { id } = paramId.parse(req.params);
  const haveProduct = await findProductByAdmin("id", id);
  if (!haveProduct)
    return next(createHttpError(404, "This product is not exist."));
  const data = updateProductSehcma.parse(req.body);
  if (data.sku && data.sku !== haveProduct.sku) {
    const haveSku = await findProductByAdmin("sku", data.sku);
    if (haveSku) return next(createHttpError(409, "This SKU is already exist"));
  }
  if (data.productCategoryId) {
    const catExist = await findCategoryBy("id", data.productCategoryId);
    if (!catExist)
      return next(createHttpError(400, "The given category is not found."));
  }
  const prod = await setProduct(id, data);
  res.status(200).json({
    success: true,
    message: "Updated",
    porduct: prod,
  });
};

//review later
export const deleteProduct = async (req, res, next) => {
  const { id } = paramId.parse(req.params);
  const haveProduct = await findProductByAdmin("id", id);
  if (!haveProduct)
    return next(createHttpError(404, "This product is not exist."));

  await removeProduct(id);
  res.status(200).json({
    success: true,
    message: "Deletd successfully",
  });
};
