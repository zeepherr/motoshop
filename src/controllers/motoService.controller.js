import createHttpError from "http-errors";
import {
  addService,
  findAllServices,
  findServiceBy,
  findServiceByAdmin,
  removeServ,
  setService,
} from "../services/motoservice.service.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validations/motoService.schema.js";

export const getAllService = async (req, res, next) => {
  const serv = await findAllServices({ isActive: true });
  if (serv.length === 0) {
    return next(createHttpError(204, "No service found"));
  }
  res.status(200).json({
    success: true,
    message: "Get all availabel motors",
    data: serv,
  });
};

export const getAllServiceAdmin = async (req, res, next) => {
  const serv = await findAllServices();
  if (serv.length === 0) {
    return next(createHttpError(204, "No service found"));
  }
  res.status(200).json({
    success: true,
    message: "Get all  motors",
    data: serv,
  });
};

export const getServiceBy = async (req, res, next) => {
  const id = +req.params.id;
  const haveServ = await findServiceBy("id", id);
  if (!haveServ) return next(createHttpError(404, "This service is not exist"));
  return res.status(200).json({
    success: true,
    message: "Get a moto Successfully",
    data: haveServ,
  });
};

export const createService = async (req, res, next) => {
  const data = createServiceSchema.parse(req.body);
  const haveService = await findServiceByAdmin("name", data.name);
  if (haveService)
    return next(createHttpError(409, "This service name already exist."));
  const serv = await addService(data);
  res.status(201).json({
    success: true,
    message: "A service is added",
    data: serv,
  });
};

export const updateService = async (req, res, next) => {
  const servId = +req.params.id;
  const haveServ = await findServiceByAdmin("id", servId);
  if (!haveServ)
    return next(createHttpError(404, "This service is not exist."));
  const data = updateServiceSchema.parse(req.body);
  if (Object.keys(data).length === 0) {
    return next(createHttpError(400, "No changes were provided."));
  }
  if (data.name !== undefined && data.name !== haveServ.name) {
    const sameName = await findServiceByAdmin("name", data.name);
    if (sameName)
      return next(createHttpError(409, "This moto is already exist."));
  }
  const Serv = await setService(servId, data);
  return res.status(200).json({
    success: true,
    message: "Update successfully",
    data: Serv,
  });
};

//review later
export const deleteService = async (req, res, next) => {
  const id = +req.params.id;
  const haveServ = await findServiceByAdmin("id", id);
  if (!haveServ)
    return next(createHttpError(409, "This service is not exist."));
  await removeServ(id);
  return res.status(200).json({
    success: true,
    message: "This service has been deleted",
    data: null,
  });
};
