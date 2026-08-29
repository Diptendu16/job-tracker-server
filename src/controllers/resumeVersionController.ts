import { Response } from "express";
import * as resumeVersionService from "../services/resumeVersionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { WorkspaceRequest } from "../middleware/workspaceAuth.js";

export const listResumeVersionsHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const resumeVersions = await resumeVersionService.listResumeVersions(
      req.params.workspaceId as string,
    );
    res
      .status(200)
      .json(new ApiResponse(200, resumeVersions, "Resume versions fetched"));
  },
);

export const createResumeVersionHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const resumeVersion = await resumeVersionService.createResumeVersion(
      req.params.workspaceId as string,
      req.userId!,
      req.body,
    );
    res
      .status(201)
      .json(new ApiResponse(201, resumeVersion, "Resume version created"));
  },
);

export const deleteResumeVersionHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    await resumeVersionService.deleteResumeVersion(
      req.params.workspaceId as string,
      req.params.id as string,
    );
    res.status(200).json(new ApiResponse(200, null, "Resume version deleted"));
  },
);
