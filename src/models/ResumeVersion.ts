import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IResumeVersion extends Document {
  workspace: Types.ObjectId;
  createdBy: Types.ObjectId;
  name: string;
  url?: string;
  notes?: string;
}

const resumeVersionSchema = new Schema<IResumeVersion>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

resumeVersionSchema.index({ workspace: 1, createdAt: -1 });

export const ResumeVersion: Model<IResumeVersion> =
  mongoose.model<IResumeVersion>("ResumeVersion", resumeVersionSchema);
