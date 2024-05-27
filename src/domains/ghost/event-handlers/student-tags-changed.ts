import { eventBus, Events } from "../../../events/event-bus.ts";
import { getMemberByEmail, updateMemberLabels } from "../api.ts";

eventBus.subscribe(Events.StudentTagsChangedEvent, async ({ data: { student } }) => {
  const member = await getMemberByEmail(student.email);
  if (!member) return;
  await updateMemberLabels(member, student.tags);
});
