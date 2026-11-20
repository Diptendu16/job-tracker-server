import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { Membership } from "../models/Membership.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const isProduction = process.env.NODE_ENV === "production";

// Used for BOTH setting and clearing the cookie. A cookie set with secure/sameSite=none
// is only removed by a clear that uses the same attributes.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
};

function setTokenCookie(res: Response, token: string) {
  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Friendly message for the normal case. A true simultaneous race is caught by the
    // unique index and becomes a 409 in the error handler.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already exists with this email");
    }

    const session = await mongoose.startSession();
    let userId = "";
    let userName = "";
    let userEmail = "";
    let workspaceId = "";
    let workspaceName = "";

    try {
      // All three writes succeed together, or none of them are kept
      await session.withTransaction(async () => {
        const [user] = await User.create([{ name, email, password }], {
          session,
        });
        const [workspace] = await Workspace.create(
          [
            {
              name: `${user.name}'s Workspace`,
              owner: user._id,
              isPersonal: true,
            },
          ],
          { session },
        );
        await Membership.create(
          [{ workspace: workspace._id, user: user._id, role: "OWNER" }],
          { session },
        );

        userId = user._id.toString();
        userName = user.name;
        userEmail = user.email;
        workspaceId = workspace._id.toString();
        workspaceName = workspace.name;
      });
    } finally {
      await session.endSession();
    }

    const token = generateToken(userId);
    setTokenCookie(res, token);

    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: { id: userId, name: userName, email: userEmail },
          workspace: { id: workspaceId, name: workspaceName },
          token,
        },
        "User registered successfully",
      ),
    );
  },
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const workspace = await Workspace.findOne({
    owner: user._id,
    isPersonal: true,
  });

  const token = generateToken(user._id.toString());
  setTokenCookie(res, token);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: { id: user._id, name: user.name, email: user.email },
        workspace: workspace
          ? { id: workspace._id, name: workspace.name }
          : null,
        token,
      },
      "Login successful",
    ),
  );
});

export const logoutUser = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  const workspaceDoc = await Workspace.findOne({
    owner: req.userId,
    isPersonal: true,
  });
  const workspace = workspaceDoc
    ? { id: workspaceDoc._id, name: workspaceDoc.name }
    : null;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, name: user.name, email: user.email },
          workspace,
        },
        "Current user fetched",
      ),
    );
});
