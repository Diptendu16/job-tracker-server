import * as activityService from "../services/activityService.js";
import type { CreateActivityInput } from "../services/activityService.js";
import { emitToWorkspace } from "../socket/emit.js";

export async function logActivity(input: CreateActivityInput) {
  try {
    const activity = await activityService.createActivity(input);

    emitToWorkspace(input.workspaceId, "activity.created", {
      workspaceId: input.workspaceId,
      activity,
    });
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
}
