import { z } from "zod";

const motorBrandName = z
  .string()
  .trim()
  .min(2, "Motor brand name must be at least 2 characters")
  .max(50, "Motor brand name must not exceed 50 characters");

// CREATE
export const createMotorBrandSchema = z
  .object({
    name: motorBrandName,
  })
  .strict();

// UPDATE NAME
export const updateMotorBrandSchema = z.object({
  name: motorBrandName.optional(),
  isActive: z
    .boolean({
      error: "isActive must be a boolean",
    })
    .optional(),
});


