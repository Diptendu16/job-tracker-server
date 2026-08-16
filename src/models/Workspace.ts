import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  owner: Types.ObjectId;
  isPersonal: boolean;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPersonal: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Workspace: Model<IWorkspace> = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);
