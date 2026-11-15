import { Response } from "express";
import * as inviteService from "../services/inviteService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const getInviteDetailsHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const details = await inviteService.getInviteDetails(
      req.params.token as string,
    );
    res
      .status(200)
      .json(new ApiResponse(200, details, "Invite details fetched"));
  },
);

export const acceptInviteHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspace = await inviteService.acceptInvite(
      req.params.token as string,
      req.userId!,
    );
    res.status(200).json(new ApiResponse(200, workspace, "Invite accepted"));
  },
);
