import type { Request } from "express";
import { getIO } from "./index.js";

export interface Actor {
  id: string;
  name: string;
}

// The frontend sends its socket ID in an X-Socket-Id header on every request.
export function getSocketIdFromRequest(req: Request): string | undefined {
  const header = req.headers["x-socket-id"];
  return typeof header === "string" && header.length > 0 ? header : undefined;
}

export function emitToWorkspace(
  workspaceId: string,
  event: string,
  payload: Record<string, unknown>,
  excludeSocketId?: string,
) {
  try {
    // Round-trip through JSON so the payload is exactly what the REST API would return
    // (ObjectIds become strings, Dates become ISO strings).
    const plainPayload = JSON.parse(JSON.stringify(payload));

    const target = getIO().to(workspaceId);
    (excludeSocketId ? target.except(excludeSocketId) : target).emit(
      event,
      plainPayload,
    );
  } catch (error) {
    // Best-effort: the database write already succeeded, so a failed emit must never fail the request.
    console.error(`Failed to emit ${event}:`, error);
  }
}
