import { prisma } from "../lib/primsa.js";

export const findAllServices = async (where = {}) => {
  return await prisma.service.findMany({ where });
};

export const findServiceBy = async (column, value) => {
  return await prisma.service.findFirst({
    where: { [column]: value },
  });
};

export const addService = async (servName, servDescription, servPrice) => {
  return await prisma.service.create({
    data: {
      name: servName,
      price: servPrice,
      description: servDescription,
    },
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
