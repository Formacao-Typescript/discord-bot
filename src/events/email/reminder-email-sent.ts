import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";

export const [ReminderEmailSentEvent, createReminderEmailSentEvent] = defineEvent(
  "reminder_email_sent",
  z.object({
    email: z.string().email(),
  }),
);
