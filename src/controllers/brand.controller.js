import createHttpError from "http-errors";
import {
  addBrand,
  findAllBrands,
  findBrandBy,
  findBrandByAdmin,
  removeBrandByid,
  setBrand,
} from "../services/brand.service.js";
import { findMototBySelect } from "../services/moto.service.js";
import {
  createMotorBrandSchema,
  updateMotorBrandSchema,
} from "../validations/brand.schema.js";

export const getAllBrands = async (req, res, next) => {
  const brands = await findAllBrands({ isActive: true });
  if (brands.length === 0) {
    return res.status(200).json({
      message: "No brands found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all aviailabel brand",
    data: brands,
  });
};
export const getAllBrandAdmin = async (req, res, next) => {
  const brands = await findAllBrands();
  if (brands.length === 0) {
    return res.status(200).json({
      message: "No brand found",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all motorbrands.",
    data: brands,
  });
};

export const getBrandById = async (req, res, next) => {
  const id = +req.params.id;
  const haveBrand = await findBrandBy("id", id);
  if (!haveBrand) return next(createHttpError(404, "This brand is not exist"));
  return res.status(200).json({
    success: true,
    message: "Get a brand successfully",
    data: haveBrand,
  });
};

export const createBrand = async (req, res, next) => {
  const { name } = createMotorBrandSchema.parse(req.body);
  const haveBrand = await findBrandBy("name", name);
  if (haveBrand) return next(createHttpError(409, "This brand already exist"));
  const brand = await addBrand(name);
  res.status(201).json({
    success: true,
    message: "A brand is added.",
    data: brand,
  });
};

//review later

export const updateBrand = async (req, res, next) => {
  const id = +req.params.id;
  const data = updateMotorBrandSchema.parse(req.body);
  const haveBrand = await findBrandByAdmin("id", id);
  if (!haveBrand) return next(createHttpError(409, "This brand is not exist."));
  if (data.name) {
    const sameName = await findBrandByAdmin("name", data.name);
    if (sameName)
      return next(createHttpError(409, "This name is already exist."));
  }
  if (data.isActive === false) {
    const relatedMots = await findMototBySelect("motorBrandId", id);
    if (relatedMots)
      return next(
        createHttpError(
          409,
          "Sorry,This brand is still related to another fields",
        ),
      );
  }
  const brand = await setBrand(id, data);
  return res.status(200).json({
    success: true,
    message: "Updated a brand",
    data: brand,
  });
};

export const deleteBrand = async (req, res, next) => {
  const id = +req.params.id;
  const haveBrand = await findBrandByAdmin("id", id);
  if (!haveBrand) return next(createHttpError(409, "This brand is not exist."));
  const relatedMots = await findMototBySelect("motorBrandId", id);
  if (relatedMots)
    return next(
      createHttpError(
        409,
        "Sorry,This brand is still related to another fields",
      ),
    );
  await removeBrandByid(id);
  return res.status(200).json({
    success: true,
    message: "This brand has been deleted",
    data: null,
  });
};
