import { Invite } from "../models/Invite.js";
import { Membership } from "../models/Membership.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/ApiError.js";

export async function getInviteDetails(token: string) {
  const invite = await Invite.findOne({ token }).populate("workspace");
  if (!invite) throw new ApiError(404, "Invite not found");
  if (invite.expiresAt < new Date())
    throw new ApiError(410, "This invite link has expired");

  const ws = invite.workspace as any;
  return { workspaceName: ws.name, workspaceId: ws._id.toString() };
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await Invite.findOne({ token });
  if (!invite) throw new ApiError(404, "Invite not found");
  if (invite.expiresAt < new Date())
    throw new ApiError(410, "This invite link has expired");

  const existing = await Membership.findOne({
    workspace: invite.workspace,
    user: userId,
  });
  if (!existing) {
    await Membership.create({
      workspace: invite.workspace,
      user: userId,
      role: "MEMBER",
    });
  }
  // If already a member, silently succeed instead of erroring —
  // clicking your own invite link again shouldn't be a failure case.

  const ws = await Workspace.findById(invite.workspace);
  if (!ws) throw new ApiError(404, "Workspace no longer exists");

  return { id: ws._id.toString(), name: ws.name };
}
