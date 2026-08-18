import createHttpError from "http-errors";
import {
  addService,
  findAllServices,
  findServiceBy,
  removeServ,
  setService,
} from "../services/motoservice.service.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validations/motoService.schema.js";

export const getAllService = async (req, res, next) => {
  const serv = await findAllServices({ isActive: true });
  if (motos.length === 0) {
    return res.status(200).json({
      message: "No service found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all availabel motors",
    service: serv,
  });
};

export const getAllServiceAdmin = async (req, res, next) => {
  const serv = await findAllServices();
  if (motos.length === 0) {
    return res.status(200).json({
      message: "No service found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Get all  motors",
    service: serv,
  });
};

export const getServiceBy = async (req, res, next) => {
  const id = +req.params.id;
  const haveServ = await findServiceBy("id", id);
  if (!haveServ) return next(createHttpError(404, "This service is not exist"));
  return res.status(200).json({
    success: true,
    message: "Get a moto Successfully",
    service: haveServ,
  });
};

export const createService = async (req, res, next) => {
  const { description, name, price } = createServiceSchema.parse(req.body);
  const haveService = await findServiceBy("name", name);
  if (haveService)
    return next(createHttpError(409, "This service name already exist."));
  const serv = await addService(name, description, price);
  res.status(201).json({
    success: true,
    message: "A service is added",
    service: serv,
  });
};

export const updateService = async (req, res, next) => {
  const servId = +req.params.id;
  const haveServ = await findServiceBy("id", servId);
  if (!haveServ)
    return next(createHttpError(404, "This service is not exist."));
  const data = updateServiceSchema.parse(req.body);
  await setService(servId, data);
  return res.status(200).json({
    success: true,
    message: "Update successfully",
  });
};

export const deleteService = async (req, res, next) => {
  const id = +req.params.id;
  const haveServ = await findServiceBy("id", id);
  if (!haveServ)
    return next(createHttpError(409, "This service is not exist."));
  await removeServ(id);
  return res.status(200).json({
    success: true,
    message: "This service has been deleted",
  });
};
