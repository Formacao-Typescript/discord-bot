import { eventBus, Events } from "../../../events/event-bus.ts";
import { addMember, getMemberByEmail, updateMemberLabels } from "../api.ts";

eventBus.subscribe(Events.StudentCreatedEvent, async ({ data: { student } }) => {
  const member = await getMemberByEmail(student.email);

  if (member) {
    await updateMemberLabels(member, student.tags);
    return;
  }

  await addMember(student.email, student.tags);
});
