import { z } from "zod";

const categoryName = z
  .string()
  .trim()
  .min(2, "Category  name must be at least 2 characters")
  .max(50, "Category  name must not exceed 50 characters");

// CREATE
export const createProductCategorySchema = z
  .object({
    name: categoryName,
  })
  .strict();

// UPDATE NAME
export const updateProductCategorySchema = z.object({
  name: categoryName.optional(),
  isActive: z
    .boolean({
      error: "isActive must be a boolean",
    })
    .optional(),
});

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive("Invalid product catgory ID"),
});
