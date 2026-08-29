import { z } from "zod";

export const createResumeVersionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional(),
});
