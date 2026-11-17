import { Response, Request } from "express";
import * as applicationService from "../services/applicationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { emitToWorkspace, getSocketIdFromRequest } from "../socket/emit.js";
import { logActivity } from "../utils/logActivity.js";
import type { WorkspaceRequest } from "../middleware/workspaceAuth.js";

function getActor(req: WorkspaceRequest) {
  return { id: req.userId as string, name: req.userName ?? "Someone" };
}

export const listApplicationsHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const query = (req as Request & { validatedQuery: any }).validatedQuery;
    const result = await applicationService.listApplications({
      workspaceId: req.params.workspaceId as string,
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

export const getNeedsAttentionHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const { today } = (req as Request & { validatedQuery: { today?: string } })
      .validatedQuery;
    const items = await applicationService.getNeedsAttention(
      req.params.workspaceId as string,
      today,
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, items, "Needs-attention applications fetched"),
      );
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
    const workspaceId = req.params.workspaceId as string;
    const application = await applicationService.createApplication(
      workspaceId,
      req.userId!,
      req.body,
    );

    emitToWorkspace(
      workspaceId,
      "application.created",
      { workspaceId, application, actor: getActor(req) },
      getSocketIdFromRequest(req),
    );

    await logActivity({
      workspaceId,
      actor: getActor(req),
      type: "APPLICATION_CREATED",
      application: {
        id: application._id.toString(),
        company: application.company,
        role: application.role,
      },
    });

    res
      .status(201)
      .json(new ApiResponse(201, application, "Application created"));
  },
);

export const updateApplicationHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const workspaceId = req.params.workspaceId as string;
    const { application, previousStatus } =
      await applicationService.updateApplication(
        workspaceId,
        req.params.id as string,
        req.body,
      );

    emitToWorkspace(
      workspaceId,
      "application.updated",
      { workspaceId, application, actor: getActor(req) },
      getSocketIdFromRequest(req),
    );

    // Only status changes are worth a feed entry; note/date edits are skipped
    if (previousStatus !== application.status) {
      await logActivity({
        workspaceId,
        actor: getActor(req),
        type: "STATUS_CHANGED",
        application: {
          id: application._id.toString(),
          company: application.company,
          role: application.role,
        },
        fromStatus: previousStatus,
        toStatus: application.status,
      });
    }

    res
      .status(200)
      .json(new ApiResponse(200, application, "Application updated"));
  },
);

export const deleteApplicationHandler = asyncHandler(
  async (req: WorkspaceRequest, res: Response) => {
    const workspaceId = req.params.workspaceId as string;
    const applicationId = req.params.id as string;
    const deleted = await applicationService.deleteApplication(
      workspaceId,
      applicationId,
    );

    emitToWorkspace(
      workspaceId,
      "application.deleted",
      {
        workspaceId,
        applicationId,
        actor: getActor(req),
        deletedAt: new Date().toISOString(),
      },
      getSocketIdFromRequest(req),
    );

    await logActivity({
      workspaceId,
      actor: getActor(req),
      type: "APPLICATION_DELETED",
      application: {
        id: applicationId,
        company: deleted.company,
        role: deleted.role,
      },
    });

    res.status(200).json(new ApiResponse(200, null, "Application deleted"));
  },
);
