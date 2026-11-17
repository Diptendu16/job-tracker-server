import { z } from "zod";

export const activityQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(30),
});
