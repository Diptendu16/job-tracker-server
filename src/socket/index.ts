import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Membership } from "../models/Membership.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Socket.io middleware — runs once per connection attempt, before "connection" fires.
  // Mirrors what the `protect` Express middleware does for HTTP requests.
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error("Server misconfiguration"));
      }

      const decoded = jwt.verify(token, secret) as { id: string };
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on("workspace:join", async (workspaceId: string, callback) => {
      try {
        const membership = await Membership.findOne({
          workspace: workspaceId,
          user: socket.userId,
        });

        if (!membership) {
          callback?.({
            success: false,
            message: "Not a member of this workspace",
          });
          return;
        }

        socket.join(workspaceId);
        callback?.({ success: true });
        console.log(`Socket ${socket.id} joined workspace room ${workspaceId}`);
      } catch {
        callback?.({ success: false, message: "Failed to join workspace" });
      }
    });

    socket.on("workspace:leave", (workspaceId: string) => {
      socket.leave(workspaceId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Lets other parts of the backend (controllers/services) emit events to a workspace room.
// Built now so it's ready for 8c, even though nothing calls it yet.
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
