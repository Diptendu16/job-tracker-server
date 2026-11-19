import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";

export interface IMembership extends Document {
  workspace: Types.ObjectId;
  user: Types.ObjectId;
  role: MembershipRole;
  activityClearedAt?: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER"],
      default: "MEMBER",
      required: true,
    },
    activityClearedAt: { type: Date },
  },
  { timestamps: true },
);

// A user can only have one membership per workspace
membershipSchema.index({ workspace: 1, user: 1 }, { unique: true });

export const Membership: Model<IMembership> = mongoose.model<IMembership>(
  "Membership",
  membershipSchema,
);
