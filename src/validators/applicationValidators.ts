import { z } from "zod";

// "" means "left blank" and is ignored. null means "clear this field" (meaningful on update).
// The date is parsed manually: combining z.coerce with preprocess caused a double-coercion bug.
const optionalDate = z.preprocess((val) => {
  if (val === "" || val === undefined) return undefined;
  if (val === null) return null;
  return new Date(val as string);
}, z.date().nullable().optional());

const optionalObjectId = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID")
    .nullable()
    .optional(),
);

const platformEnum = z.enum([
  "INTERNSHALA",
  "LINKEDIN",
  "NAUKRI",
  "COMPANY_WEBSITE",
  "WELLFOUND",
  "REFERRAL",
  "CAMPUS_PLACEMENT",
  "OTHER",
]);

const statusEnum = z.enum(["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"]);

const applicationShape = {
  company: z.string().trim().min(1, "Company is required"),
  role: z.string().trim().min(1, "Role is required"),
  platform: platformEnum,
  status: statusEnum,
  appliedDate: z.coerce.date({ message: "Valid applied date is required" }),
  deadline: optionalDate,
  oaDate: optionalDate,
  interviewDate: optionalDate,
  followUpDate: optionalDate,
  notes: z.string().trim().optional(),
  resumeVersion: optionalObjectId,
};

// On create, status falls back to APPLIED when it isn't provided
export const createApplicationSchema = z.object({
  ...applicationShape,
  status: statusEnum.optional().default("APPLIED"),
});

// Deliberately built from the shape WITHOUT the status default, so an update that
// doesn't mention status can never reset it to APPLIED.
export const updateApplicationSchema = z.object(applicationShape).partial();

export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: statusEnum.optional(),
  platform: platformEnum.optional(),
  company: z.string().trim().optional(),
  sortBy: z
    .enum(["appliedDate", "createdAt", "deadline"])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const needsAttentionQuerySchema = z.object({
  today: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "today must be in YYYY-MM-DD format")
    .optional(),
});
