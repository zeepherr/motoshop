import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";

export const errorHandler = (err, req, res, next) => {
  // JWT
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      code: "ACCESS_TOKEN_EXPIRED",
      message: "Access token has expired",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues.map((issue) => ({
        field: issue.path?.[0] || "request",
        message: issue.message,
      })),
    });
  }

  // Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This value already exists",
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid related record",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }
  }

  const status = err.status || err.statusCode || 500;

  console.log(`!!!ERROR MDW: status:${status}  & message-->> "${err.message}"`);

  return res.status(status).json({
    success: false,
    ...(err.code && { code: err.code }),
    ...(err.attemptsRemaining !== undefined && {
      attemptsRemaining: err.attemptsRemaining,
    }),
    ...(err.retryAfterSeconds !== undefined && {
      retryAfterSeconds: err.retryAfterSeconds,
    }),
    message: err.message || "Internal server error",
  });
};
