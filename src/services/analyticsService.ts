import mongoose from "mongoose";
import { Application } from "../models/Application.js";

const STATUSES = ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"] as const;

export async function getStatusDistribution(workspaceId: string) {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

  const results = await Application.aggregate([
    { $match: { workspace: workspaceObjectId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const distribution = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  results.forEach((r) => {
    distribution[r._id as keyof typeof distribution] = r.count;
  });

  return STATUSES.map((status) => ({ status, count: distribution[status] }));
}

export async function getApplicationsPerWeek(workspaceId: string) {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

  const results = await Application.aggregate([
    { $match: { workspace: workspaceObjectId } },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$appliedDate" },
          week: { $isoWeek: "$appliedDate" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  return results.map((r) => ({
    label: `${r._id.year}-W${String(r._id.week).padStart(2, "0")}`,
    count: r.count,
  }));
}

export async function getRateMetrics(workspaceId: string) {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const total = await Application.countDocuments({
    workspace: workspaceObjectId,
  });

  if (total === 0) {
    return {
      total: 0,
      responseRate: 0,
      reachedInterviewRate: 0,
      rejectionRate: 0,
      offerRate: 0,
    };
  }

  const [appliedOnlyCount, interviewOrFurtherCount, rejectedCount, offerCount] =
    await Promise.all([
      Application.countDocuments({
        workspace: workspaceObjectId,
        status: "APPLIED",
      }),
      Application.countDocuments({
        workspace: workspaceObjectId,
        status: { $in: ["INTERVIEW", "OFFER"] },
      }),
      Application.countDocuments({
        workspace: workspaceObjectId,
        status: "REJECTED",
      }),
      Application.countDocuments({
        workspace: workspaceObjectId,
        status: "OFFER",
      }),
    ]);

  return {
    total,
    responseRate: Math.round(((total - appliedOnlyCount) / total) * 100),
    reachedInterviewRate: Math.round((interviewOrFurtherCount / total) * 100),
    rejectionRate: Math.round((rejectedCount / total) * 100),
    offerRate: Math.round((offerCount / total) * 100),
  };
}
