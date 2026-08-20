import { Application, IApplication } from "../models/Application.js";
import { ApiError } from "../utils/ApiError.js";

interface ListParams {
  workspaceId: string;
  page: number;
  limit: number;
  status?: string;
  platform?: string;
  company?: string;
  sortBy: string;
  order: "asc" | "desc";
}

export async function listApplications(params: ListParams) {
  const { workspaceId, page, limit, status, platform, company, sortBy, order } =
    params;

  const filter: Record<string, unknown> = { workspace: workspaceId };
  if (status) filter.status = status;
  if (platform) filter.platform = platform;
  if (company) filter.company = { $regex: company, $options: "i" }; // case-insensitive partial match

  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getApplicationById(workspaceId: string, id: string) {
  const application = await Application.findOne({
    _id: id,
    workspace: workspaceId,
  });
  if (!application) {
    throw new ApiError(404, "Application not found");
  }
  return application;
}

export async function createApplication(
  workspaceId: string,
  userId: string,
  data: Partial<IApplication>,
) {
  return Application.create({
    ...data,
    workspace: workspaceId,
    createdBy: userId,
  });
}

export async function updateApplication(
  workspaceId: string,
  id: string,
  data: Partial<IApplication>,
) {
  const application = await Application.findOneAndUpdate(
    { _id: id, workspace: workspaceId },
    data,
    { new: true, runValidators: true },
  );
  if (!application) {
    throw new ApiError(404, "Application not found");
  }
  return application;
}

export async function deleteApplication(workspaceId: string, id: string) {
  const application = await Application.findOneAndDelete({
    _id: id,
    workspace: workspaceId,
  });
  if (!application) {
    throw new ApiError(404, "Application not found");
  }
  return application;
}
