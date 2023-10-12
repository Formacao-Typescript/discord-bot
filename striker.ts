import { ptera } from "./src/deps.ts";
import { getConfig } from "./src/util/config.ts";
import { getStorage } from "./src/util/db/db.ts";
import { HydratedStudent } from "./src/util/db/students.ts";
import { sendStrikeEmail } from "./src/util/mail.ts";
const config = getConfig();

const storage = await getStorage();
const DAYS_BEFORE_FIRST_STRIKE = 7;
const DAYS_BETWEEN_EACH_STRIKE = 3;
const STRIKE_TEMPLATES = [
  "first",
  "second",
  "third",
] as const;

async function strike(student: HydratedStudent) {
  const template = STRIKE_TEMPLATES[student.strikes ?? 0];
  const inviteLink = student.discordInviteLink || config.defaultDiscordInvite;
  await sendStrikeEmail(student.email, inviteLink, template);
  await student.strike();
}

for await (const student of storage.students.list({ discordId: "" })) {
  const createdAt = ptera.datetime(student.createdAt);
  const daysSinceCreated = ptera.diffInDays(createdAt, ptera.DateTime.now());

  if (daysSinceCreated < DAYS_BEFORE_FIRST_STRIKE) continue;

  const strikes = student.strikes ?? 0;
  const lastStrike = student.lastStrike ? ptera.datetime(student.lastStrike) : null;
  const daysSinceLastStrike = lastStrike ? ptera.diffInDays(lastStrike, ptera.DateTime.now()) : 0;

  if (strikes > 0 && daysSinceLastStrike < DAYS_BETWEEN_EACH_STRIKE) continue;

  await strike(student);
}
