import crypto from "crypto";
import { Membership } from "../models/Membership.js";
import { Invite } from "../models/Invite.js";
import { ApiError } from "../utils/ApiError.js";

export async function listMyWorkspaces(userId: string) {
  const memberships = await Membership.find({ user: userId }).populate(
    "workspace",
  );

  return memberships
    .filter((m) => m.workspace) 
    .map((m) => {
      const ws = m.workspace as any;
      return {
        id: ws._id.toString(),
        name: ws.name,
        role: m.role,
        isPersonal: ws.isPersonal,
      };
    });
}

export async function createInvite(
  workspaceId: string,
  userId: string,
  role?: string,
) {
  if (role !== "OWNER") {
    throw new ApiError(403, "Only the workspace owner can create invites");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return Invite.create({
    workspace: workspaceId,
    createdBy: userId,
    token,
    expiresAt,
  });
}
