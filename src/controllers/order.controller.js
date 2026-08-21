import createHttpError from "http-errors";
import {
  CustomerType,
  OrderItemType,
  OrderStatus,
  PaymentMethod,
} from "../generated/prisma/index.js";
import { prisma } from "../lib/primsa.js";
import {
  findServiceForOrder,
  findServiceForOrderTx,
} from "../services/motoservice.service.js";
import {
  cancelPendingOrder,
  claimPendingOrder,
  createCompletedOrderTx,
  createPendingOrder,
  findOrderById,
  findOrderByIdTx,
  findPendingOrders,
  setPendingOrderData,
} from "../services/order.service.js";
import {
  decreaseProductStock,
  findProductForOrder,
  findProductForOrderTx,
} from "../services/product.service.js";
import { findMemberForOrder } from "../services/user.service.js";
import { paramId } from "../validations/general.schema.js";
import {
  checkoutOrderSchema,
  completeOrderSchema,
  createOrderSchema,
  updatePendingOrderSchema,
} from "../validations/order.schema.js";

export const createOrder = async (req, res, next) => {
  const data = createOrderSchema.parse(req.body);
  let member;
  if (data.memberId) {
    member = await findMemberForOrder(data.memberId);
    if (!member)
      return next(
        createHttpError(404, `Member with Id:${data.memberId} does not exist.`),
      );
  }
  const preparedOrderItems = [];
  let subtotal = 0;
  //must use loop because item is arrar[]
  for (const item of data.items) {
    if (item.itemType === OrderItemType.PRODUCT) {
      const product = await findProductForOrder(item.productId);
      if (!product) {
        return next(
          createHttpError(
            404,
            `Product with ID:${item.productId} does not exist.`,
          ),
        );
      }
      if (product.stockQuantity < item.quantity) {
        return next(
          createHttpError(
            409,
            `Insufficient stock for ${product.name}. Available:${product.stockQuantity}`,
          ),
        );
      }
      const unitPrice = Number(product.sellingPrice);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      preparedOrderItems.push({
        itemType: OrderItemType.PRODUCT,
        productId: product.id,
        serviceId: null,
        itemNameSnapshot: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }
    if (item.itemType === OrderItemType.SERVICE) {
      const service = await findServiceForOrder(item.serviceId);
      if (!service) {
        return next(
          createHttpError(
            404,
            `Service with Id:${item.serviceId} does not exist.`,
          ),
        );
      }
      const unitPrice = Number(service.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      preparedOrderItems.push({
        itemType: OrderItemType.SERVICE,

        productId: null,
        serviceId: service.id,

        itemNameSnapshot: service.name,

        quantity: item.quantity,

        unitPrice,
        lineTotal,
      });
    }
  }
  const motorId = member?.userMotors?.[0].motorId ?? null;
  const customerType = member ? "MEMBER" : "GUEST";
  const order = await createPendingOrder({
    handledById: req.user.id,
    memberId: member?.id ?? null,
    motorId,
    subtotal,
    items: preparedOrderItems,
    customerType,
  });
  res.status(200).json({
    success: true,
    message: "Order datat is valid",
    data: order,
  });
};

export const getPendingOrders = async (req, res, next) => {
  const orders = await findPendingOrders();
  return res.status(200).json({
    success: true,
    message: "Pending oreders retrived successfully",
    data: orders,
  });
};

export const getOrderById = async (req, res, next) => {
  const { id: orderId } = paramId.parse(req.params);

  const order = await findOrderById(orderId);
  if (!order)
    return next(createHttpError(404`Order with ID:${orderId} does not exist.`));

  return res.status(200).json({
    success: true,
    message: "Order retrived successsfully.",
    data: order,
  });
};

export const updatePeindingOrder = async (req, res, next) => {
  const { id: orderId } = paramId.parse(req.params);

  const data = updatePendingOrderSchema.parse(req.body);
  const order = await findOrderById(orderId);
  if (!order) return next(createHttpError(404, "Pending order not found."));
  if (order.status !== OrderStatus.PENDING)
    return next(createHttpError(409, "Only pending orders can be updated"));
  let member = null;

  const memberIdToUse =
    data.memberId === undefined ? order.memberId : data.memberId;

  if (memberIdToUse) {
    member = await findMemberForOrder(memberIdToUse);

    if (!member) {
      return next(
        createHttpError(404, `Member with ID:${memberIdToUse} does not exist.`),
      );
    }
  }
  const preparedOrderItems = [];
  let subtotal = 0;

  for (const item of data.items) {
    if (item.itemType === OrderItemType.PRODUCT) {
      const product = await findProductForOrder(item.productId);

      if (!product) {
        return next(
          createHttpError(
            404,
            `Product with ID:${item.productId} does not exist.`,
          ),
        );
      }

      if (product.stockQuantity < item.quantity) {
        return next(
          createHttpError(409, `Insufficient stock for ${product.name}.`),
        );
      }

      const unitPrice = Number(product.sellingPrice);
      const lineTotal = unitPrice * item.quantity;

      subtotal += lineTotal;

      preparedOrderItems.push({
        itemType: OrderItemType.PRODUCT,
        productId: product.id,
        serviceId: null,
        itemNameSnapshot: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    if (item.itemType === OrderItemType.SERVICE) {
      const service = await findServiceForOrder(item.serviceId);

      if (!service) {
        return next(
          createHttpError(
            404,
            `Service with ID:${item.serviceId} does not exist.`,
          ),
        );
      }

      const unitPrice = Number(service.price);
      const lineTotal = unitPrice * item.quantity;

      subtotal += lineTotal;

      preparedOrderItems.push({
        itemType: OrderItemType.SERVICE,
        productId: null,
        serviceId: service.id,
        itemNameSnapshot: service.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }
  }
  const motorId = member?.userMotors?.[0]?.motorId ?? null;

  const customerType = member ? CustomerType.MEMBER : CustomerType.GUEST;

  const updatedOrder = await setPendingOrderData({
    orderId,
    memberId: member?.id ?? null,
    motorId,
    customerType,

    subtotal,
    items: preparedOrderItems,
  });

  return res.status(200).json({
    success: true,
    message: "Pending order updated successfully.",
    data: updatedOrder,
  });
};

export const completeOrder = async (req, res, next) => {
  const { id: orderId } = paramId.parse(req.params);
  const data = completeOrderSchema.parse(req.body);

  const haveOrder = await findOrderById(orderId);

  if (!haveOrder) {
    return next(
      createHttpError(404, `Order with ID:${orderId} does not exist.`),
    );
  }

  if (haveOrder.status !== OrderStatus.PENDING) {
    return next(createHttpError(409, "Only pending orders can be completed."));
  }
  const finalTotal = Number(haveOrder.finalTotal);
  if (
    data.paymentMethod === PaymentMethod.CASH &&
    data.receivedAmount < finalTotal
  ) {
    return next(
      createHttpError(400, "Received amount is less than the order total"),
    );
  }
  if (
    data.paymentMethod === PaymentMethod.QR &&
    data.receivedAmount !== finalTotal
  ) {
    return next(
      createHttpError(400, "QR payment amount must match the order total."),
    );
  }

  const completedOrder = await prisma.$transaction(async (tx) => {
    const claimed = await claimPendingOrder(tx, orderId, {
      paymentMethod: data.paymentMethod,
      receivedAmount: data.receivedAmount,
    });

    if (claimed.count === 0) {
      throw createHttpError(409, "This order is no longer pending");
    }
    const order = await findOrderByIdTx(tx, orderId);
    const freshTotal = Number(order.finalTotal);

    if (
      data.paymentMethod === PaymentMethod.CASH &&
      data.receivedAmount < freshTotal
    ) {
      throw createHttpError(
        409,
        "Order total changed. Received amount is insufficient.",
      );
    }

    if (
      data.paymentMethod === PaymentMethod.QR &&
      data.receivedAmount !== freshTotal
    ) {
      throw createHttpError(
        409,
        "Order total changed. QR payment amount does not match.",
      );
    }
    for (const item of order.orderItems) {
      if (item.itemType !== OrderItemType.PRODUCT) {
        continue;
      }
      const stockResult = await decreaseProductStock(
        tx,
        item.productId,
        item.quantity,
      );
      if (stockResult.count === 0) {
        throw createHttpError(
          // --> cannot be use return next error  the transition can be return within transition
          409,
          `Product ID:${item.productId}is unavialable or insufficient stock.`,
        );
      }
    }
    return await findOrderByIdTx(tx, orderId);
  });
  const changeAmount =
    data.paymentMethod === PaymentMethod.CASH
      ? data.receivedAmount - Number(completedOrder.finalTotal)
      : 0;
  return res.status(200).json({
    success: true,
    message: "Order completed successfully.",
    data: {
      ...completedOrder,
      changeAmount,
    },
  });
};

export const cancelOrder = async (req, res, next) => {
  const { id: orderId } = paramId.parse(req.params);
  const order = await findOrderById(orderId); //status==>pending
  if (!order) {
    return next(createHttpError(404, `Order Id:${orderId} does not exist.`));
  }
  if (order.status !== OrderStatus.PENDING) {
    return next(createHttpError(409, "Only pending orders can be cancelled."));
  }

  const result = await cancelPendingOrder(orderId);
  if (result.count === 0) {
    return next(createHttpError(409, "This order is no longer pending."));
  }
  const cancelledOrder = await findOrderById(orderId); //cancelled
  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    data: cancelledOrder,
  });
};

export const checkoutOrder = async (req, res, next) => {
  const data = checkoutOrderSchema.parse(req.body);
  let member = null; //check if member
  if (data.memberId) {
    member = await findMemberForOrder(data.memberId);
    if (!member) {
      return next(
        createHttpError(404, `Member with ID:${data.memberId} does not exist.`),
      );
    }
    if (member.role !== "MEMBER") {
      return next(createHttpError(409, "The selected user is not a member."));
    }
  }
  const memberId = member?.id ?? null;

  const motorId = member?.userMotors?.[0]?.motorId ?? null;

  const customerType = member ? CustomerType.MEMBER : CustomerType.GUEST;

  try {
    const completedOrder = await prisma.$transaction(async (tx) => {
      const preparedOrderItems = [];

      let subtotal = 0;

      for (const item of data.items) {
        // PRODUCT
        if (item.itemType === OrderItemType.PRODUCT) {
          const product = await findProductForOrderTx(tx, item.productId);

          if (!product) {
            throw createHttpError(
              404,
              `Product with ID:${item.productId} is not available.`,
            );
          }

          const unitPrice = Number(product.sellingPrice);

          const lineTotal = unitPrice * item.quantity;

          // Atomic stock protection
          const stockResult = await decreaseProductStock(
            tx,
            product.id,
            item.quantity,
          );

          if (stockResult.count === 0) {
            throw createHttpError(
              409,
              `${product.name} does not have enough stock.`,
            );
          }

          subtotal += lineTotal;

          preparedOrderItems.push({
            itemType: OrderItemType.PRODUCT,

            productId: product.id,
            serviceId: null,

            itemNameSnapshot: product.name,

            quantity: item.quantity,

            unitPrice,
            lineTotal,
          });

          continue;
        }

        // SERVICE
        if (item.itemType === OrderItemType.SERVICE) {
          const service = await findServiceForOrderTx(tx, item.serviceId);

          if (!service) {
            throw createHttpError(
              404,
              `Service with ID:${item.serviceId} is not available.`,
            );
          }

          const unitPrice = Number(service.price);

          const lineTotal = unitPrice * item.quantity;

          subtotal += lineTotal;

          preparedOrderItems.push({
            itemType: OrderItemType.SERVICE,

            productId: null,
            serviceId: service.id,

            itemNameSnapshot: service.name,

            quantity: item.quantity,

            unitPrice,
            lineTotal,
          });
        }
      }

      const finalTotal = subtotal;

      if (
        data.paymentMethod === PaymentMethod.CASH &&
        data.receivedAmount < finalTotal
      ) {
        throw createHttpError(
          400,
          "Received amount is less than the order total.",
        );
      }

      if (
        data.paymentMethod === PaymentMethod.QR &&
        data.receivedAmount !== finalTotal
      ) {
        throw createHttpError(
          400,
          "QR payment amount must match the order total.",
        );
      }

      return await createCompletedOrderTx(tx, {
        handledById: req.user.id,

        memberId,
        motorId,
        customerType,

        subtotal,
        finalTotal,

        paymentMethod: data.paymentMethod,
        receivedAmount: data.receivedAmount,

        items: preparedOrderItems,
      });
    });

    const changeAmount =
      data.paymentMethod === PaymentMethod.CASH
        ? data.receivedAmount - Number(completedOrder.finalTotal)
        : 0;

    return res.status(201).json({
      success: true,
      message: "Sale completed successfully.",
      data: {
        ...completedOrder,
        changeAmount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//to be continue

// HrungMoto POS Order Backend — Continuation

// Main POS checkout:
// - Normal walk-in checkout uses ONE request:
//   POST /orders/checkout
// - It directly creates a COMPLETED order.
// - PENDING is only for Hold orders.

// Current payment:
// enum PaymentMethod {
//   CASH
//   QR
// }

// Order fields:
// - paymentMethod
// - receivedAmount

// Payment rules:
// - CASH: receivedAmount >= finalTotal
// - QR: receivedAmount === finalTotal
// - changeAmount is calculated for response only.

// Current architecture:
// - Controller = validation, business checks, errors, transaction orchestration
// - Service = clean Prisma DB operations only

// Direct checkout flow:
// Frontend cart
// → POST /orders/checkout
// → validate member/items/payment
// → get current product/service prices from DB
// → calculate subtotal/finalTotal
// → prisma transaction
// → atomic product stock decrement
// → create Order with status COMPLETED
// → nested create OrderItems
// → commit
// → return completed order

// Important stock rule:
// - Any failure inside checkout transaction must rollback everything.
// - No order created and stock unchanged on failure.

// Still need to finish:
// 1. Final testing for POST /orders/checkout
//    - CASH success
//    - QR success
//    - Product + Service
//    - Service only
//    - Guest / Member
//    - insufficient stock
//    - invalid product/service rollback
//    - CASH insufficient
//    - QR mismatch

// 2. Finish Cancel Order
//    - only PENDING → CANCELLED
//    - COMPLETED cannot cancel
//    - CANCELLED cannot cancel again
//    - no stock handling needed

// Do later:
// - GET /orders/:id
// - GET /orders/pending
// - GET /orders
// - query/search params, filters, pagination, sorting

// Next:
// Finish direct checkout testing, then Cancel Order.
