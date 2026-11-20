import { ResumeVersion } from "../models/ResumeVersion.js";
import { ApiError } from "../utils/ApiError.js";
import { Application } from "../models/Application.js";

export async function listResumeVersions(workspaceId: string) {
  return ResumeVersion.find({ workspace: workspaceId }).sort({ createdAt: -1 });
}

export async function createResumeVersion(
  workspaceId: string,
  userId: string,
  data: { name: string; url?: string; notes?: string },
) {
  return ResumeVersion.create({
    ...data,
    workspace: workspaceId,
    createdBy: userId,
  });
}

export async function deleteResumeVersion(workspaceId: string, id: string) {
  const inUse = await Application.countDocuments({
    workspace: workspaceId,
    resumeVersion: id,
  });
  if (inUse > 0) {
    throw new ApiError(
      409,
      `This resume version is used by ${inUse} application${inUse > 1 ? "s" : ""}. Change those first.`,
    );
  }

  const resumeVersion = await ResumeVersion.findOneAndDelete({
    _id: id,
    workspace: workspaceId,
  });
  if (!resumeVersion) {
    throw new ApiError(404, "Resume version not found");
  }
  return resumeVersion;
}
