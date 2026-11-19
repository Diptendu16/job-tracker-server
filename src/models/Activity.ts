import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ApplicationStatus } from "./Application.js";

export type ActivityType =
  | "APPLICATION_CREATED"
  | "STATUS_CHANGED"
  | "APPLICATION_DELETED"
  | "MEMBER_JOINED";

export interface IActivity extends Document {
  workspace: Types.ObjectId;
  actor: { userId: Types.ObjectId; name: string };
  type: ActivityType;
  application?: {
    applicationId: Types.ObjectId;
    company: string;
    role: string;
  };
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
  createdAt: Date;
}

const STATUSES = ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"];
const RETENTION_DAYS = 90;

const activitySchema = new Schema<IActivity>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    actor: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
    },
    type: {
      type: String,
      enum: [
        "APPLICATION_CREATED",
        "STATUS_CHANGED",
        "APPLICATION_DELETED",
        "MEMBER_JOINED",
      ],
      required: true,
    },
    application: {
      applicationId: { type: Schema.Types.ObjectId },
      company: { type: String },
      role: { type: String },
    },
    fromStatus: { type: String, enum: STATUSES },
    toStatus: { type: String, enum: STATUSES },
  },
  // Entries are never edited, so there is no updatedAt
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 },
);

export const Activity: Model<IActivity> = mongoose.model<IActivity>(
  "Activity",
  activitySchema,
);
