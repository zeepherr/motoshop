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
  return await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      updatedAt: true,
      imageKey: true,
      isActive: true,
      productCategoryId: true,
      sellingPrice: true,
      costPrice: true,
      sku: true,
      stockQuantity: true,
      unit: true,

      productCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findProductBy = async (column, value) => {
  return await prisma.product.findFirst({
    where: { [column]: value, isActive: true },
  });
};
export const findProductByAdmin = async (column, value) => {
  return await prisma.product.findUnique({
    where: { [column]: value },
    select: {
      id: true,
      productCategoryId: true,
      name: true,
      sku: true,
      description: true,
      costPrice: true,
      sellingPrice: true,
      stockQuantity: true,
      unit: true,
      imageKey: true, // ✅ important
      isActive: true,
    },
  });
};

export const removeProduct = async (productId) => {
  await prisma.product.delete({
    where: { id: productId },
  });
};
