import { eventBus, Events } from "../../../events/event-bus.ts";
import { getStorage } from "../db/db.ts";

eventBus.subscribe(Events.ReminderEmailSentEvent, async ({ data: { email } }) => {
  const storage = getStorage();
  const student = storage.students.hydrate(await storage.students.findByEmail(email));

  if (!student) return;

  await student.remind();
});
