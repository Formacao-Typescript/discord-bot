import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";

export const [DiscordUserUnlinkingRequestedEvent, createDiscordUserUnlinkingRequestedEvent] = defineEvent(
  "discord_user_unlinking_requested",
  z.object({
    discordId: z.string(),
  }),
);
