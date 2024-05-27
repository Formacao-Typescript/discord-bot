import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";

export const [DiscordInviteCreatedEvent, createDiscordInviteCreatedEvent] = defineEvent(
  "discord_invite_created",
  z.object({
    inviteLink: z.string(),
    email: z.string().email(),
  }),
);
