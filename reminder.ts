import { ptera } from "deps.ts";
import { getConfig } from "./src/util/config.ts";
import { getStorage } from "./src/util/db/db.ts";
import { sendReminderEmail } from "./src/util/mail.ts";
const config = getConfig();

const storage = getStorage();
const DAYS_BEFORE_FIRST_REMINDER = 7;
const DAYS_BETWEEN_EACH_REMINDER = 3;
const REMINDER_TEMPLATES = [
  "first",
  "second",
  "third",
] as const;

const students = storage.students.list({ discordId: "" }) ?? [];

for await (const student of students) {
  if (!student) continue;
  const createdAt = ptera.datetime(student.createdAt);
  const daysSinceCreated = ptera.diffInDays(createdAt, ptera.DateTime.now());

  if (daysSinceCreated < DAYS_BEFORE_FIRST_REMINDER) continue;

  const reminders = student.reminders ?? 0;
  const lastReminder = student.lastReminder ? ptera.datetime(student.lastReminder) : null;
  const daysSinceLastReminder = lastReminder ? ptera.diffInDays(lastReminder, ptera.DateTime.now()) : 0;

  if (reminders > 0 && daysSinceLastReminder < DAYS_BETWEEN_EACH_REMINDER) continue;

  const template = REMINDER_TEMPLATES[student.reminders ?? 0];
  const inviteLink = student.discordInviteLink || config.defaultDiscordInvite;
  await sendReminderEmail(student.email, inviteLink, template);
  await student.remind();
}
