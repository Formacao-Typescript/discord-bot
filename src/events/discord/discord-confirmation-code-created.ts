import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";

export const [DiscordConfirmationCodeCreatedEvent, createDiscordConfirmationCodeCreatedEvent] = defineEvent(
  "discord_confirmation_created",
  z.object({
    email: z.string().email(),
    userId: z.string(),
    code: z.string(),
  }),
);
