import { eventBus, Events } from "../../../events/event-bus.ts";
import { createStudentTagsChangedEvent } from "../../../events/students/student-tags-changed.ts";
import { getStorage } from "../db/db.ts";

const storage = getStorage();

eventBus.subscribe(Events.PurchaseRevokedEvent, async ({ data: { buyer: { email }, offer } }) => {
  const student = await storage.students.findByEmail(email);

  if (!student) return;

  await student.addTags(`revoked-${offer}`);
  await student.removeTags(`offer-${offer}`);

  await eventBus.emit(
    createStudentTagsChangedEvent({
      student,
      from: student.tags.concat(`offer-${offer}`),
      to: student.tags,
      changeset: {
        added: [`revoked-${offer}`],
        removed: [`offer-${offer}`],
      },
    }),
  );
});
