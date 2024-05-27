import { z } from "deps.ts";
import { defineEvent } from "../event-engine.ts";

export const [WelcomeEmailSentEvent, createWelcomeEmailSentEvent] = defineEvent(
  "welcome_email_sent",
  z.object({
    email: z.string().email(),
  }),
);
