import { Response } from "express";
import * as inviteService from "../services/inviteService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { logActivity } from "../utils/logActivity.js";
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
    const result = await inviteService.acceptInvite(
      req.params.token as string,
      req.userId!,
    );

    // Re-clicking an invite you've already used is a no-op, so it isn't logged again
    if (result.joined) {
      await logActivity({
        workspaceId: result.id,
        actor: { id: req.userId!, name: req.userName ?? "Someone" },
        type: "MEMBER_JOINED",
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { id: result.id, name: result.name },
          "Invite accepted",
        ),
      );
  },
);
