import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Service name is required")
    .max(100, "Service name must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional(),

  price: z.coerce //converter to number
    .number({
      error: "Price must be a number",
    })
    .positive("Price must be greater than 0"),
});

export const updateServiceSchema = createServiceSchema.partial(); //some part of create
