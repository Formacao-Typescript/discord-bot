import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";

export const [DiscordUserLinkingCompleteEvent, createDiscordUserLinkingCompleteEvent] = defineEvent(
  "discord_user_linking_complete",
  z.object({
    discordId: z.string(),
    email: z.string(),
  }),
);
