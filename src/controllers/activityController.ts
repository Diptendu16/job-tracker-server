import { Response, Request } from "express";
import * as activityService from "../services/activityService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { WorkspaceRequest } from "../middleware/workspaceAuth.js";

export const listActivityHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const { limit } = (req as Request & { validatedQuery: { limit: number } })
      .validatedQuery;
    const entries = await activityService.listActivity(
      req.params.workspaceId as string,
      limit,
    );
    res.status(200).json(new ApiResponse(200, entries, "Activity fetched"));
  },
);
