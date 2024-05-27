import { ptera } from "deps.ts";
import { getConfig } from "./src/common/config.ts";
import { getStorage } from "./src/common/db/db.ts";
import { sendReminderEmail } from "./src/domains/email/mail.ts";
import { eventBus } from "./src/events/event-bus.ts";
import { createReminderEmailSentEvent } from "./src/events/email/reminder-email-sent.ts";
const config = getConfig();

const storage = getStorage();
const DAYS_BEFORE_FIRST_REMINDER = 7;
const DAYS_BETWEEN_EACH_REMINDER = 3;
const REMINDER_TEMPLATES = [
  "first",
  "second",
  "third",
] as const;

const students = storage.students.findWithoutDiscord() ?? [];

for await (const student of students) {
  if (!student) continue;
  const createdAt = ptera.datetime(student.createdAt);
  const daysSinceCreated = ptera.diffInDays(createdAt, ptera.DateTime.now());

  if (daysSinceCreated < DAYS_BEFORE_FIRST_REMINDER) continue;

  const reminders = student.discord?.reminders ?? 0;
  const lastReminder = student.discord?.lastReminder ? ptera.datetime(student.discord?.lastReminder) : null;
  const daysSinceLastReminder = lastReminder ? ptera.diffInDays(lastReminder, ptera.DateTime.now()) : 0;

  if (reminders > 0 && daysSinceLastReminder < DAYS_BETWEEN_EACH_REMINDER) continue;

  const template = REMINDER_TEMPLATES[student.discord?.reminders ?? 0];
  const inviteLink = student.discord?.inviteLink || config.defaultDiscordInvite;
  await sendReminderEmail(student.email, inviteLink, template);
  await eventBus.emit(createReminderEmailSentEvent({ email: student.email }));
}
