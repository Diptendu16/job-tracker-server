import { Response } from "express";
import * as workspaceService from "../services/workspaceService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import type { WorkspaceRequest } from "../middleware/workspaceAuth.js";

export const listWorkspacesHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const workspaces = await workspaceService.listMyWorkspaces(req.userId!);
    res
      .status(200)
      .json(new ApiResponse(200, workspaces, "Workspaces fetched"));
  },
);

export const createInviteHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const invite = await workspaceService.createInvite(
      req.params.workspaceId as string,
      req.userId!,
      req.membershipRole,
    );
    const link = `${process.env.CLIENT_URL}/invite/${invite.token}`;
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { link, expiresAt: invite.expiresAt },
          "Invite created",
        ),
      );
  },
);
