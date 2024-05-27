import { eventBus, Events } from "../../../events/event-bus.ts";
import { sendWelcomeEmail } from "../mail.ts";

eventBus.subscribe(Events.DiscordInviteCreatedEvent, async ({ data: { email, inviteLink } }) => {
  await sendWelcomeEmail(email, inviteLink);
});
