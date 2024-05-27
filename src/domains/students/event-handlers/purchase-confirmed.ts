import { eventBus, Events } from "../../../events/event-bus.ts";
import { createStudentCreatedEvent } from "../../../events/students/student-created.ts";
import { getStorage } from "../db/db.ts";

const storage = getStorage();

eventBus.subscribe(Events.PurchaseConfirmedEvent, async ({ data: { buyer, offer } }) => {
  const student = storage.students.hydrate(await storage.students.findByEmail(buyer.email));

  if (!student) {
    await storage.students.create(buyer.email, offer, [`tier:${offer}`, `origin:hotmart`]);
    return;
  }

  await student.addTags(`tier:${offer}`);

  await eventBus.emit(createStudentCreatedEvent({ student }));
});
