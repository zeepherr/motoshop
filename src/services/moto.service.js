import { prisma } from "../lib/primsa.js";

export const addMoto = async (modelName, brandId, motoType) => {
  return await prisma.motor.create({
    data: { model: modelName, motorBrandId: brandId, type: motoType },
  });
};

export const findMototBy = async (column, value) => {
  return await prisma.motor.findFirst({
    where: { [column]: value, isActive: true },
  });
};
export const findMototByAdmin = async (column, value) => {
  return await prisma.motor.findFirst({
    where: { [column]: value },
  });
};
export const findMototBySelect = async (column, value) => {
  return await prisma.motor.findFirst({
    where: { [column]: value },
    select: {
      id: true,
    },
  });
};

export const findAllMotos = async (where = {}) => {
  return await prisma.motor.findMany({
    where,
    select: {
      id: true,
      model: true,
      motorBrandId: true,
      isActive: true,

      motorBrand: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const setMoto = async (motoId, data) => {
  return await prisma.motor.update({
    where: { id: motoId },
    data,
  });
};

export const removeMoto = async (motoId) => {
  await prisma.motor.delete({ where: { id: motoId } });
};
