import { Request, Response } from "express";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { Workspace } from "../models/Workspace.js";
import { Membership } from "../models/Membership.js";

//setting the cookie
function setTokenCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true, //js running in the browser cannot access this cookie
    secure: process.env.NODE_ENV === "production", //only send over HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already exists with this email");
    }

    const user = await User.create({ name, email, password });

    // Auto-create a personal workspace for the new user
    const workspace = await Workspace.create({
      name: `${user.name}'s Workspace`,
      owner: user._id,
      isPersonal: true,
    });

    await Membership.create({
      workspace: workspace._id,
      user: user._id,
      role: "OWNER",
    });

    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: { id: user._id, name: user.name, email: user.email },
          workspace: { id: workspace._id, name: workspace.name },
          token,
        },
        "User registered successfully",
      ),
    );
  },
);

//login user
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

//logout user
export const logoutUser = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

//current user
//this will be a protected route, only accessible after loging in
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
