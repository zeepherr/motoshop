import createHttpError from "http-errors";
import {
  addCategory,
  findAllCategories,
  findCategoryBy,
  findCategoryByAdmin,
  removeCategoryByid,
  setCategory,
} from "../services/category.service.js";
import { findProductByAdmin } from "../services/product.service.js";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from "../validations/category.schema.js";

export const getAllCategory = async (req, res, next) => {
  const cate = await findAllCategories({ isActive: true });
  if (cate.length === 0) {
    return res.status(200).json({
      message: "No category found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all aviailabel categories",
    data: cate,
  });
};

export const getAllCategoryAdmin = async (req, res, next) => {
  const cate = await findAllCategories();
  if (cate.length === 0) {
    return res.status(200).json({
      message: "No category found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all category.",
    data: cate,
  });
};

export const getCategoryById = async (req, res, next) => {
  const id = +req.params.id;
  const haveCat = await findCategoryBy("id", id);
  if (!haveCat) return next(createHttpError(404, "This category is not exist"));
  return res.status(200).json({
    success: true,
    message: "Get a category successfully",
    data: haveCat,
  });
};

export const createCategory = async (req, res, next) => {
  const { name } = createProductCategorySchema.parse(req.body);
  const haveCat = await findCategoryBy("name", name);
  if (haveCat) return next(createHttpError(409, "This category already exist"));
  const cate = await addCategory(name);
  res.status(201).json({
    success: true,
    message: "A category is added.",
    data: cate,
  });
};

//review later
export const updateCatgory = async (req, res, next) => {
  const id = +req.params.id;
  const haveCate = await findCategoryByAdmin("id", id);
  if (!haveCate)
    return next(createHttpError(409, "This category is not exist."));
  const data = updateProductCategorySchema.parse(req.body);
  if (data.name) {
    const sameName = await findCategoryByAdmin("name", data.name);
    if (sameName)
      return next(createHttpError(409, "This name is already exist."));
  }
  if (data.isActive === false) {
    const haveProduct = await findProductByAdmin("productCategoryId", id);
    if (haveProduct)
      return next(
        createHttpError(
          409,
          "Cannot deactivate this category because it still contains products.",
        ),
      );
  }
  const cate = await setCategory(id, data);
  return res.status(200).json({
    success: true,
    message: "Updated successfully",
    data: cate,
  });
};

export const deleteCategory = async (req, res, next) => {
  const id = +req.params.id;
  const haveCate = await findCategoryByAdmin("id", id);
  if (!haveCate)
    return next(createHttpError(409, "This categroy is not exist."));
  const haveProduct = await findProductByAdmin("productCategoryId", id);
  if (haveProduct)
    return next(
      createHttpError(
        409,
        "Cannot deactivate this category because it still contains products.",
      ),
    );
  await removeCategoryByid(id);
  return res.status(200).json({
    success: true,
    message: "This category has been deleted",
    data: null,
  });
};
