import { z } from "zod";

const optionalDate = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) return undefined;
  return new Date(val as string);
}, z.date().optional());

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

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  role: z.string().trim().min(1, "Role is required"),
  platform: platformEnum,
  status: statusEnum.optional().default("APPLIED"),
  appliedDate: z.coerce.date({ message: "Valid applied date is required" }),
  deadline: optionalDate,
  oaDate: optionalDate,
  interviewDate: optionalDate,
  followUpDate: optionalDate,
  notes: z.string().trim().optional(),
  resumeVersion: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export const updateApplicationSchema = createApplicationSchema.partial();

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
