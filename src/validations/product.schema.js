import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must not exceed 100 characters"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU must not exceed 50 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit must not exceed 30 characters"),

  costPrice: z.coerce
    .number({
      error: "Cost price must be a number",
    })
    .min(0, "Cost price cannot be negative"),

  sellingPrice: z.coerce
    .number({
      error: "Selling price must be a number",
    })
    .positive("Selling price must be greater than 0"),

  stockQuantity: z.coerce
    .number({
      error: "Stock quantity must be a number",
    })
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),

  productCategoryId: z.coerce
    .number({
      error: "Product category is required",
    })
    .int("Product category ID must be an integer")
    .positive("Invalid product category"),
});

export const updateProductSehcma = createProductSchema.partial().extend({
  isActive: z.boolean({ error: "isActive must be a boolean" }).optional(),
});
