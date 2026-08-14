import { prisma } from "../lib/primsa.js";

export const findBrandBy = async (column, value) => {
  return await prisma.motorBrand.findFirst({
    where: { [column]: value },
    select: { isActive: true },
  });
};

export const addBrand = async (brandName) => {
  return await prisma.motorBrand.create({
    data: { name: brandName },
  });
};

export const findAllBrandUser = async () => {
  return await prisma.motorBrand.findMany({ where: { isActive: true } });
};

export const findAllBrandAdmin = async () => {
  return await prisma.motorBrand.findMany({ include: { isActive: false } });
};
export const updateBrandBy = async (brandId, column, value) => {
  return await prisma.motorBrand.update({
    where: { id: brandId },
    data: {
      [column]: value,
    },
  });
};

export const removeBrandByid = async (brandId) => {
  await prisma.motorBrand.delete({
    where: { id: brandId },
  });
};
