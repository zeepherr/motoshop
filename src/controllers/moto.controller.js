import createHttpError from "http-errors";
import { findBrandBy } from "../services/brand.service.js";
import {
  addMoto,
  countMotorRelations,
  findAllMotos,
  findMototBy,
  findMototByAdmin,
  removeMoto,
  setMoto,
} from "../services/moto.service.js";
import {
  createMotorSchema,
  updateMotorSchema,
} from "../validations/moto.schema.js";

export const getAllMoto = async (req, res, next) => {
  const motos = await findAllMotos({ isActive: true });
  if (motos.length === 0) {
    return res.status(200).json({
      messsage: "No available found.",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all availabel motors",
    data: motos,
  });
};

export const getAllMotoAdmin = async (req, res, next) => {
  const motos = await findAllMotos();
  if (motos.length === 0) {
    return res.status(204).json({
      messsage: "No available found.",
      data: null,
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all  motors",
    data: motos,
  });
};

export const getMotoBy = async (req, res, next) => {
  const id = +req.params.id;
  const haveMoto = await findMototBy("id", id);
  if (!haveMoto)
    return next(createHttpError(404, "This moto is not available"));
  return res.status(200).json({
    success: true,
    message: "Get a moto Successfully",
    moto: haveMoto,
  });
};

export const createMoto = async (req, res, next) => {
  const { model, motorBrandId, type } = createMotorSchema.parse(req.body);
  const haveMoto = await findMototByAdmin("model", model);
  if (haveMoto)
    return next(createHttpError(409, "This moto is already exist."));
  const motorBrand = await findBrandBy("id", motorBrandId);
  if (!motorBrand)
    return next(createHttpError(404, "The given motorBrand is not exist"));

  const moto = await addMoto(model, motorBrandId, type);
  res.status(201).json({
    success: true,
    message: "A motor is added ",
    data: moto,
  });
};

export const updateMoto = async (req, res, next) => {
  console.log(req.body);
  const motoId = +req.params.id;
  const haveMoto = await findMototByAdmin("id", motoId);
  if (!haveMoto) return next(createHttpError(404, "This moto is not exist."));
  const data = updateMotorSchema.parse(req.body);
  console.log(data);
  if (Object.keys(data).length === 0) {
    return next(createHttpError(400, "No changes were provided."));
  }
  if (data.motorBrandId !== undefined) {
    const motorBrand = await findBrandBy("id", data.motorBrandId);
    if (!motorBrand)
      return next(createHttpError(404, "The given motorBrand is not exist"));
  }
  if (data.model !== undefined && data.model !== haveMoto.model) {
    const sameModel = await findMototByAdmin("model", data.model);
    if (sameModel)
      return next(createHttpError(409, "This moto is already exist."));
  }

  const moto = await setMoto(motoId, data);
  return res.status(200).json({
    success: true,
    message: "Update successfully",
    data: moto,
  });
};

//review later
export const deleteMoto = async (req, res, next) => {
  const id = +req.params.id;
  const haveMoto = await findMototByAdmin("id", id);
  if (!haveMoto) return next(createHttpError(409, "This moto is not exist."));
  const relation = await countMotorRelations(id);
  if (relation.orders > 0) {
    return next(
      createHttpError(
        409,
        "This motorcycle has order history and cannot be deleted.",
      ),
    );
  }

  if (relation.users > 0) {
    return next(
      createHttpError(
        409,
        "This motorcycle is assigned to existing users and cannot be deleted.",
      ),
    );
  }
  await removeMoto(id);
  return res.status(200).json({
    success: true,
    message: "This motor has been deleted",
    data: null,
  });
};
