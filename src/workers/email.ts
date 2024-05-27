import { z } from "deps.ts";
import { getStorage } from "../util/db/db.ts";
import { nsDebug } from "../util/debug.ts";
import { sendConfirmationEmail } from "../util/mail.ts";
const log = nsDebug("workers:email");

const EmailMessage = z.object({
  type: z.literal("sendConfirmationCode"),
  email: z.string().email(),
  userId: z.string(),
  tier: z.string(),
});

type EmailMessage = z.infer<typeof EmailMessage>;

export const createEmailMessage = (email: string, userId: string, tier: string): EmailMessage => ({
  type: "sendConfirmationCode",
  email,
  userId,
  tier,
});

const isValidMessage = (message: unknown): message is EmailMessage => EmailMessage.safeParse(message).success;

export const emailQueueWorker = async (message: unknown) => {
  log("Received message", message);
  if (!isValidMessage(message)) {
    log("Invalid message. Skipping");
    return;
  }

  log("Valid message. Processing");

  const { email, userId, tier } = message;

  log(`Sending confirmation email to ${email} for user ${userId} with tier ${tier}`);

  const storage = getStorage();
  const code = await storage.confirmation.create(userId, email, tier);

  log(`Created confirmation code ${code} for user ${userId} with tier ${tier}`);

  await sendConfirmationEmail(email, code);

  log(`Sent confirmation email to ${email} for user ${userId} with tier ${tier}`);
};
