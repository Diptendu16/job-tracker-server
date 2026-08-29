import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ApplicationStatus =
  | "APPLIED"
  | "OA"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

export type ApplicationPlatform =
  | "INTERNSHALA"
  | "LINKEDIN"
  | "NAUKRI"
  | "COMPANY_WEBSITE"
  | "WELLFOUND"
  | "REFERRAL"
  | "CAMPUS_PLACEMENT"
  | "OTHER";

export interface IApplication extends Document {
  workspace: Types.ObjectId;
  createdBy: Types.ObjectId;
  company: string;
  role: string;
  platform: ApplicationPlatform;
  status: ApplicationStatus;
  appliedDate: Date;
  deadline?: Date;
  oaDate?: Date;
  interviewDate?: Date;
  followUpDate?: Date;
  lastActivityAt: Date;
  notes?: string;
  resumeVersion?: Types.ObjectId;
}

const applicationSchema = new Schema<IApplication>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    platform: {
      type: String,
      enum: [
        "INTERNSHALA",
        "LINKEDIN",
        "NAUKRI",
        "COMPANY_WEBSITE",
        "WELLFOUND",
        "REFERRAL",
        "CAMPUS_PLACEMENT",
        "OTHER",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"],
      default: "APPLIED",
      required: true,
    },
    appliedDate: { type: Date, required: true },
    deadline: { type: Date },
    oaDate: { type: Date },
    interviewDate: { type: Date },
    notes: { type: String, trim: true },
    resumeVersion: { type: Schema.Types.ObjectId, ref: "ResumeVersion" },
    followUpDate: { type: Date },
    lastActivityAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

// For Kanban board queries: "all applications in this workspace with status X"
applicationSchema.index({ workspace: 1, status: 1 });
// For listing/sorting by recency
applicationSchema.index({ workspace: 1, createdAt: -1 });
// For Phase 6 deadline queries
applicationSchema.index({ workspace: 1, deadline: 1 });

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  "Application",
  applicationSchema,
);
