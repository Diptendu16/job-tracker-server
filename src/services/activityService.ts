import { Activity, type ActivityType } from "../models/Activity.js";
import type { ApplicationStatus } from "../models/Application.js";
import { Membership } from "../models/Membership.js";

export interface CreateActivityInput {
  workspaceId: string;
  actor: { id: string; name: string };
  type: ActivityType;
  application?: { id: string; company: string; role: string };
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
}

export async function createActivity(input: CreateActivityInput) {
  return Activity.create({
    workspace: input.workspaceId,
    actor: { userId: input.actor.id, name: input.actor.name },
    type: input.type,
    application: input.application
      ? {
          applicationId: input.application.id,
          company: input.application.company,
          role: input.application.role,
        }
      : undefined,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
  });
}

export async function listActivity(
  workspaceId: string,
  userId: string,
  limit: number,
) {
  const membership = await Membership.findOne({
    workspace: workspaceId,
    user: userId,
  }).select("activityClearedAt");

  const filter: Record<string, unknown> = { workspace: workspaceId };
  if (membership?.activityClearedAt) {
    filter.createdAt = { $gt: membership.activityClearedAt };
  }

  return Activity.find(filter).sort({ createdAt: -1 }).limit(limit);
}

export async function clearActivity(workspaceId: string, userId: string) {
  // The server sets the time, so it never depends on the browser's clock
  const clearedAt = new Date();
  await Membership.updateOne(
    { workspace: workspaceId, user: userId },
    { activityClearedAt: clearedAt },
  );
  return clearedAt;
}

