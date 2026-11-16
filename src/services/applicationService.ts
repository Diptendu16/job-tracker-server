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

const ACTIVE_STATUSES = ["APPLIED", "OA", "INTERVIEW"];
const STALE_DAYS = 7;
const DEADLINE_WARNING_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

// Stored dates are midnight UTC of the calendar date the user picked. To compare like with like,
// "today" must also be midnight UTC of the user's own calendar date, not the current instant.
function resolveTodayStart(today: string | undefined, now: Date): Date {
  if (today) {
    const parsed = new Date(`${today}T00:00:00.000Z`);
    // Rejects impossible dates like 2026-02-31, which JS would silently roll over to March
    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().startsWith(today)
    ) {
      return parsed;
    }
  }
  // No usable date from the client: fall back to the server's current UTC date
  return new Date(`${now.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export async function listAllApplicationsForBoard(workspaceId: string) {
  return Application.find({ workspace: workspaceId }).sort({ createdAt: -1 });
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
    { ...data, lastActivityAt: new Date() },
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

export async function getNeedsAttention(workspaceId: string, today?: string) {
  const now = new Date();
  const todayStart = resolveTodayStart(today, now);
  const staleThreshold = new Date(now.getTime() - STALE_DAYS * DAY_MS);
  const deadlineWarningThreshold = new Date(
    todayStart.getTime() + DEADLINE_WARNING_DAYS * DAY_MS,
  );

  const applications = await Application.find({
    workspace: workspaceId,
    status: { $in: ACTIVE_STATUSES },
    $or: [
      { deadline: { $lte: deadlineWarningThreshold, $exists: true } },
      { followUpDate: { $lte: todayStart, $exists: true } },
      { lastActivityAt: { $lte: staleThreshold } },
    ],
  }).sort({ lastActivityAt: 1 });

  return applications.map((app) => {
    const reasons: string[] = [];
    if (app.deadline && app.deadline <= deadlineWarningThreshold) {
      reasons.push(
        app.deadline < todayStart ? "Deadline passed" : "Deadline soon",
      );
    }
    if (app.followUpDate && app.followUpDate <= todayStart) {
      reasons.push("Follow-up due");
    }
    if (app.lastActivityAt <= staleThreshold) {
      reasons.push("Stale (no activity)");
    }
    return { application: app, reasons };
  });
}
