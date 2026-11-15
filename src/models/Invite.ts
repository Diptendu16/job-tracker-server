import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvite extends Document {
  workspace: Types.ObjectId;
  createdBy: Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Invite: Model<IInvite> = mongoose.model<IInvite>(
  "Invite",
  inviteSchema,
);
