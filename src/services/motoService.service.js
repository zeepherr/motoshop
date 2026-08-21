import { prisma } from "../lib/primsa.js";

export const addService = async (data) => {
  return await prisma.service.create({
    data,
  });
};
export const findAllServices = async (where = {}) => {
  return await prisma.service.findMany({ where });
};

export const findServiceByAdmin = async (column, value) => {
  return await prisma.service.findFirst({
    where: { [column]: value },
  });
};
export const findServiceBy = async (column, value) => {
  return await prisma.service.findFirst({
    where: { [column]: value, isActive: true },
  });
};

export const setService = async (servId, data) => {
  return await prisma.service.update({
    where: { id: servId },
    data,
  });
};

export const removeServ = async (servId) => {
  return await prisma.service.delete({
    where: { id: servId },
  });
};

//for order
export const findServiceForOrder = async (serviceId) => {
  return await prisma.service.findUnique({
    where: {
      id: serviceId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      isActive: true,
    },
  });
};

export const findServiceForOrderTx = async (tx, serviceId) => {
  return await tx.service.findUnique({
    where: {
      id: serviceId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });
};
