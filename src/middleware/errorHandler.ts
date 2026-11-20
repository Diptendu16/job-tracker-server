import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

function hasProp<K extends string>(
  err: unknown,
  key: K,
): err is Record<K, unknown> {
  return typeof err === "object" && err !== null && key in err;
}

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

  // Expired is a subclass of the general JWT error, so it must be checked first
  if (err instanceof jwt.TokenExpiredError) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Session expired. Please log in again.",
      });
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid authentication token." });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ success: false, message: `Invalid ${err.path}` });
  }

  // MongoDB duplicate key (e.g. two registrations with the same email at the same instant)
  if (hasProp(err, "code") && err.code === 11000) {
    const field =
      hasProp(err, "keyValue") &&
      typeof err.keyValue === "object" &&
      err.keyValue
        ? Object.keys(err.keyValue)[0]
        : undefined;
    return res.status(409).json({
      success: false,
      message: field
        ? `A record with this ${field} already exists`
        : "Record already exists",
    });
  }

  // Errors raised by Express's body parser
  if (hasProp(err, "type") && err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ success: false, message: "Request body is not valid JSON" });
  }
  if (hasProp(err, "type") && err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ success: false, message: "Request body is too large" });
  }

  console.error("Unexpected error:", err);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
}
