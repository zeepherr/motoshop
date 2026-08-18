import { prisma } from "../lib/primsa.js";

export const findBrandBy = async (column, value) => {
  return await prisma.motorBrand.findFirst({
    where: { [column]: value, isActive: true },
  });
};
export const findBrandByAdmin = async (column, value) => {
  return await prisma.motorBrand.findFirst({
    where: { [column]: value },
  });
};

export const addBrand = async (brandName) => {
  return await prisma.motorBrand.create({
    data: { name: brandName },
  });
};

export const findAllBrands = async (where = {}) => {
  return await prisma.motorBrand.findMany({ where });
};
export const setBrand = async (brandId, data) => {
  return await prisma.motorBrand.update({
    where: { id: brandId },
    data,
  });
};

export const removeBrandByid = async (brandId) => {
  await prisma.motorBrand.delete({
    where: { id: brandId },
  });
};
