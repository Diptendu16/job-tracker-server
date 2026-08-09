import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
