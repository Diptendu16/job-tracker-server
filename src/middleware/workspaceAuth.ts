import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Membership } from "../models/Membership.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthRequest } from "./authMiddleware.js";

export interface WorkspaceRequest extends AuthRequest {
  membershipRole?: string;
}

export const requireWorkspaceMembership = asyncHandler(
  async (req: WorkspaceRequest, _res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId as string;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      throw new ApiError(400, "Invalid workspace ID");
    }

    const membership = await Membership.findOne({
      workspace: workspaceId,
      user: req.userId,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this workspace");
    }

    req.membershipRole = membership.role;
    next();
  },
);
