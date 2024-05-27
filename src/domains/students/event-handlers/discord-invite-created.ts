import { eventBus, Events } from "../../../events/event-bus.ts";
import { getStorage } from "../db/db.ts";

const storage = getStorage();

eventBus.subscribe(Events.DiscordInviteCreatedEvent, async ({ data: { email, inviteLink } }) => {
  await storage.students.setDiscordLinkByEmail(email, inviteLink);
});
