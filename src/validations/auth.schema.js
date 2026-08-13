import { z } from "zod";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;
const identityKey = (val) => (emailRegex.test(val) ? "email" : "phone");
export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    firstName: z.string().min(3, "First name is required more than 3 chars!"),
    lastName: z.string().min(3, "Last name is requred more than 3 chars!"),
    password: z.string().min(4, "password required at least 4 characters"),
    confirmPassword: z.string().min(4, "confirm password is required"),
    role: z
      .literal("MEMBER", {
        error: 'Only "MEMBER" role is allowed during registration',
      })
      .optional(),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: " confirmPassword must match to password!",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identity: z
    .string()
    .min(3, "Email or phone-number is required")
    .refine((value) => emailRegex.test(value) || phoneRegex.test(value), {
      message: "identity must be a valid email or phone number",
    }),
  password: z.string().min(4, "password required at least 4 characters"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),

  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});
