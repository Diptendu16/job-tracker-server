import { Activity, type ActivityType } from "../models/Activity.js";
import type { ApplicationStatus } from "../models/Application.js";

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

export async function listActivity(workspaceId: string, limit: number) {
  return Activity.find({ workspace: workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit);
}