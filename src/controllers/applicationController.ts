import { Response } from "express";
import * as applicationService from "../services/applicationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { WorkspaceRequest } from "../middleware/workspaceAuth.js";
import type { Request } from "express";

export const listApplicationsHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const query = (req as Request & { validatedQuery: any }).validatedQuery;
    const result = await applicationService.listApplications({
      workspaceId: req.params.workspaceId,
      ...query,
    });
    res.status(200).json(new ApiResponse(200, result, "Applications fetched"));
  },
);

export const listBoardApplicationsHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const applications = await applicationService.listAllApplicationsForBoard(
      req.params.workspaceId as string,
    );
    res
      .status(200)
      .json(new ApiResponse(200, applications, "Board applications fetched"));
  },
);

export const getApplicationHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const application = await applicationService.getApplicationById(
      req.params.workspaceId as string,
      req.params.id as string,
    );
    res
      .status(200)
      .json(new ApiResponse(200, application, "Application fetched"));
  },
);

export const createApplicationHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const application = await applicationService.createApplication(
      req.params.workspaceId as string,
      req.userId!,
      req.body,
    );
    res
      .status(201)
      .json(new ApiResponse(201, application, "Application created"));
  },
);

export const updateApplicationHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const application = await applicationService.updateApplication(
      req.params.workspaceId as string,
      req.params.id as string,
      req.body,
    );
    res
      .status(200)
      .json(new ApiResponse(200, application, "Application updated"));
  },
);

export const deleteApplicationHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    await applicationService.deleteApplication(
      req.params.workspaceId as string,
      req.params.id as string,
    );
    res.status(200).json(new ApiResponse(200, null, "Application deleted"));
  },
);
