import { prisma } from "../lib/primsa.js";

export const addProduct = async (data) => {
  return await prisma.product.create({
    data,
  });
};

export const setProduct = async (productId, data) => {
  return await prisma.product.update({
    where: { id: productId },
    data,
  });
};

export const findAllProducts = async (where = {}) => {
  return await prisma.product.findMany({ where });
};

export const findProductBy = async (column, value) => {
  return await prisma.product.findFirst({
    where: { [column]: value, isActive: true },
  });
};
export const findProductByAdmin = async (column, value) => {
  return await prisma.product.findFirst({
    where: { [column]: value },
    select: { id: true },
  });
};

export const removeProduct = async (productId) => {
  await prisma.product.delete({
    where: { id: productId },
  });
};
