import { Response } from "express";
import * as analyticsService from "../services/analyticsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { WorkspaceRequest } from "../middleware/workspaceAuth.js";

export const getAnalyticsHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const workspaceId = req.params.workspaceId as string;

    const [statusDistribution, applicationsPerWeek, rates] = await Promise.all([
      analyticsService.getStatusDistribution(workspaceId),
      analyticsService.getApplicationsPerWeek(workspaceId),
      analyticsService.getRateMetrics(workspaceId),
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { statusDistribution, applicationsPerWeek, rates },
          "Analytics fetched",
        ),
      );
  },
);
