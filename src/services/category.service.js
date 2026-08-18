import { prisma } from "../lib/primsa.js";

export const findCategoryBy = async (column, value) => {
  return await prisma.productCategory.findFirst({
    where: { [column]: value, isActive: true },
  });
};
export const findCategoryByAdmin = async (column, value) => {
  return await prisma.productCategory.findFirst({
    where: { [column]: value },
  });
};

export const addCategory = async (category) => {
  return await prisma.productCategory.create({
    data: { name: category },
  });
};

export const findAllCategories = async (where = {}) => {
  return await prisma.productCategory.findMany({ where });
};

export const setCategory = async (catId, data) => {
  return await prisma.productCategory.update({
    where: { id: catId },
    data,
  });
};

export const removeCategoryByid = async (catId) => {
  await prisma.productCategory.delete({
    where: { id: catId },
  });
};
