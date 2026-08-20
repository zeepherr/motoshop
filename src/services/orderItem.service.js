import { prisma } from "../lib/primsa.js";
export const countProductOrderItems = async (productId) => {
  return await prisma.orderItem.count({
    where: {
      productId,
    },
  });
};
