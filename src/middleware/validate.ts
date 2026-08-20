import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(
        400,
        "Validation failed",
        formatZodErrors(result.error),
      );
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new ApiError(
        400,
        "Invalid query parameters",
        formatZodErrors(result.error),
      );
    }
    // Store parsed/coerced query separately — req.query is read-only in Express 5
    (req as Request & { validatedQuery: typeof result.data }).validatedQuery =
      result.data;
    next();
  };
}

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
