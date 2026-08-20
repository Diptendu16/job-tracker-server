import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export function validateObjectId(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName] as string)) {
      throw new ApiError(400, `Invalid ${paramName}`);
    }
    next();
  };
}
