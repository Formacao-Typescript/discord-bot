import { eventBus, Events } from "../../../events/event-bus.ts";
import { getStorage } from "../db/db.ts";

const storage = getStorage();

eventBus.subscribe(Events.WelcomeEmailSentEvent, async ({ data: { email } }) => {
  await storage.students.updateByEmail(email, { welcomeEmailSent: true });
});
