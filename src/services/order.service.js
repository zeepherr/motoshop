import { OrderStatus } from "../generated/prisma/index.js";
import { prisma } from "../lib/primsa.js";

export const createPendingOrder = async ({
  handledById,
  memberId,
  motorId,
  subtotal,
  items,
  customerType,
}) => {
  return await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      handledById,
      memberId,
      motorId,
      customerType,
      subtotal,
      discountRate: 0,
      discountAmount: 0,
      finalTotal: subtotal,
      status: OrderStatus.PENDING,
      orderItems: {
        create: items, //prisma nested create
      },
    },
    include: {
      orderItems: true, //this mean after created return with its values
    },
  });
};

export const findPendingOrders = async () => {
  return await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
    },
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findOrderById = async (orderId) => {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
    },
  });
};

export const setPendingOrderData = async ({
  orderId,
  memberId,
  motorId,
  customerType,
  subtotal,
  items,
}) => {
  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      memberId,
      motorId,
      customerType,

      subtotal,
      finalTotal: subtotal,

      orderItems: {
        deleteMany: {},

        create: items,
      },
    },
    include: {
      orderItems: true,
    },
  });
};

// export const completePendingOrder = async (orderId) => {
//   return await prisma.$transaction(async (tx) => {
//     const order = await tx.order.findUnique({
//       where: {
//         id: orderId,
//       },
//       include: {
//         orderItems: true,
//       },
//     });

//     if (!order) {
//       throw createHttpError(404, `Order ID:${orderId} does not exist.`);
//     }

//     if (order.status !== OrderStatus.PENDING) {
//       throw createHttpError(409, "Only pending orders can be completed.");
//     }

//     // Atomically claim this pending order.
//     const claimedOrder = await tx.order.updateMany({
//       where: {
//         id: orderId,
//         status: OrderStatus.PENDING,
//       },
//       data: {
//         status: OrderStatus.COMPLETED,
//       },
//     });

//     if (claimedOrder.count === 0) {
//       throw createHttpError(
//         409,
//         "This order is already being completed or is no longer pending.",
//       );
//     }

//     // Handle product stock.
//     for (const item of order.orderItems) {
//       if (item.itemType !== OrderItemType.PRODUCT) {
//         continue;
//       }

//       const result = await tx.product.updateMany({
//         where: {
//           id: item.productId,
//           isActive: true,
//           stockQuantity: {
//             gte: item.quantity,
//           },
//         },
//         data: {
//           stockQuantity: {
//             decrement: item.quantity,
//           },
//         },
//       });

//       if (result.count === 0) {
//         throw createHttpError(
//           409,
//           `Product ID:${item.productId} does not have enough stock.`,
//         );
//       }
//     }

//     return await tx.order.findUnique({
//       where: {
//         id: orderId,
//       },
//       include: {
//         orderItems: true,
//       },
//     });
//   });
// };

export const claimPendingOrder = async (tx, orderId, paymentData) => {
  return await tx.order.updateMany({
    where: {
      id: orderId,
      status: OrderStatus.PENDING,
    },
    data: {
      status: OrderStatus.COMPLETED,
      paymentMethod: paymentData.paymentMethod,
      receivedAmount: paymentData.receivedAmount,
    },
  });
};

export const findOrderByIdTx = async (tx, orderId) => {
  return await tx.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
    },
  });
};

export const cancelPendingOrder = async (orderId) => {
  return await prisma.order.updateMany({
    where: {
      id: orderId,
      status: OrderStatus.PENDING,
    },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });
};

export const createCompletedOrderTx = async (
  tx,
  {
    handledById,
    memberId,
    motorId,
    customerType,
    subtotal,
    finalTotal,
    paymentMethod,
    receivedAmount,
    items,
  },
) => {
  return await tx.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,

      handledById,
      memberId,
      motorId,
      customerType,

      subtotal,
      discountRate: 0,
      discountAmount: 0,
      finalTotal,

      paymentMethod,
      receivedAmount,

      status: OrderStatus.COMPLETED,

      orderItems: {
        create: items,
      },
    },

    include: {
      orderItems: true,
    },
  });
};
