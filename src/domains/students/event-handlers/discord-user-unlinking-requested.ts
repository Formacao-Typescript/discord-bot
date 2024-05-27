import { eventBus, Events } from "../../../events/event-bus.ts";
import { getStorage } from "../db/db.ts";

eventBus.subscribe(Events.DiscordUserUnlinkingRequestedEvent, async ({ data: { discordId } }) => {
  const storage = getStorage();
  await storage.students.unlinkByDiscordId(discordId);
});
