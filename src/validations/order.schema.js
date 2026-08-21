import { z } from "zod";
import { OrderItemType, PaymentMethod } from "../generated/prisma/index.js";

const orderItemSchema = z
  .object({
    itemType: z.enum(OrderItemType),
    productId: z.number().int().positive().optional(),
    serviceId: z.number().int().positive().optional(),
    quantity: z.number().int().positive(),
  })
  .superRefine((item, ctx) => {
    if (item.itemType === "PRODUCT") {
      if (!item.productId) {
        ctx.addIssue({
          code: "custom",
          path: ["productId"],
          message: "Product ID is required.",
        });
      }

      if (item.serviceId) {
        ctx.addIssue({
          code: "custom",
          path: ["serviceId"],
          message: "Service ID is not allowed for product item.",
        });
      }
    }
    if (item.itemType === "SERVICE") {
      if (!item.serviceId) {
        ctx.addIssue({
          code: "custom",
          path: ["serviceId"],
          message: "Service ID is required.",
        });
      }

      if (item.productId) {
        ctx.addIssue({
          code: "custom",
          path: ["productId"],
          message: "Product ID is not allowed for service item.",
        });
      }
    }
  });

export const createOrderSchema = z.object({
  memberId: z.number().int().positive().nullable().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item."),
});

//zod validate each field and superRefine validate the relation of the fields(item refer to the incomming fileds and ctx refer to custom validation error )

export const updatePendingOrderSchema = z.object({
  memberId: z.number().int().positive().nullable().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item."),
});

export const completeOrderSchema = z.object({
  paymentMethod: z.enum(PaymentMethod),
  receivedAmount: z.coerce
    .number()
    .positive("Received amount must be greater than 0."),
});

export const checkoutOrderSchema = z
  .object({
    memberId: z.number().int().positive().nullable().optional(),

    items: z
      .array(orderItemSchema)
      .min(1, "Order must contain at least one item."),

    paymentMethod: z.enum(PaymentMethod),

    receivedAmount: z.coerce
      .number()
      .positive("Received amount must be greater than 0."),
  })
  .strict();
