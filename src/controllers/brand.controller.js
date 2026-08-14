import createHttpError from "http-errors";
import {
  addBrand,
  findAllBrandAdmin,
  findAllBrandUser,
  findBrandBy,
  removeBrandByid,
  updateBrandBy,
} from "../services/brand.service.js";
import {
  createMotorBrandSchema,
  updateMotorBrandSchema,
  updateMotorBrandStatusSchema,
} from "../validations/brand.schema.js";

export const getAllBrandUser = async (req, res, next) => {
  const brands = await findAllBrandUser();
  res.status(200).json({
    success: true,
    message: "Get all aviailabel brand",
    motorBrand: brands,
  });
};
export const getAllBrandAdmin = async (req, res, next) => {
  const brands = await findAllBrandAdmin();
  res.status(200).json({
    success: true,
    message: "Get all motorbrands.",
    motorBrands: brands,
  });
};

export const getBrandById = async (req, res, next) => {
  const id = +req.params.id;
  const haveBrand = await findBrandBy("id", id);
  if (!haveBrand) return next(createHttpError(404, "This brand is not exist"));
  return res.status(200).json({
    success: true,
    message: "Get a brand successfully",
    motorBrand: haveBrand,
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
    motorBrand: brand,
  });
};

export const updateBrand = async (req, res, next) => {
  const id = +req.params.id;
  const { name } = updateMotorBrandSchema.parse(req.body);
  const haveBrand = await findBrandBy("id", id);
  if (!haveBrand) return next(createHttpError(409, "This brand is not exist."));
  if (haveBrand.name === name)
    return next(createHttpError(409, "Please enter a different name."));

  const newName = await updateBrandBy(id, "name", name);
  return res.status(200).json({
    success: true,
    message: "Updated a brand name.",
    motorBrand: newName,
  });
};

export const updateBrandStatus = async (req, res, next) => {
  const id = +req.params.id;
  const { isActive } = updateMotorBrandStatusSchema.parse(req.body);
  const haveBrand = await findBrandBy("id", id);
  if (!haveBrand) return next(createHttpError(404, "This brand is not exist."));
  if (haveBrand.isActive === isActive)
    return next(
      createHttpError(
        409,
        isActive
          ? "This brand is already active"
          : "This brand is already inActive",
      ),
    );

  const newName = await updateBrandBy(id, "isActive", isActive);
  return res.status(200).json({
    success: true,
    message: "Updated brand status aleady.",
    motorBrand: newName,
  });
};

export const deleteBrand = async (req, res, next) => {
  const id = +req.params.id;
  const haveBrand = await findBrandBy("id", id);
  if (!haveBrand) return next(createHttpError(409, "This brand is not exist."));
  await removeBrandByid(id);
  return res.status(200).json({
    success: true,
    message: "This brand has been deleted",
  });
};
