import { sendConfirmationEmail } from "../mail.ts";
import { eventBus, Events } from "../../../events/event-bus.ts";

eventBus.subscribe(Events.DiscordConfirmationCodeCreatedEvent, async ({ data: { code, email } }) => {
  await sendConfirmationEmail(email, code);
});
