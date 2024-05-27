import { z } from "deps.ts";

export const Confirmation = z.object({
  email: z.string(),
  tier: z.string(),
  discordId: z.string(),
  code: z.string(),
  expiresAt: z.date(),
  consumed: z.boolean(),
});
