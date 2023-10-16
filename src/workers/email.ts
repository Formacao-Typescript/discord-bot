import { z } from "../deps.ts";
import { getStorage } from "../util/db/db.ts";
import { sendConfirmationEmail } from "../util/mail.ts";

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
  if (!isValidMessage(message)) return;

  const { email, userId, tier } = message;

  const storage = getStorage();
  const code = await storage.confirmation.create(userId, email, tier);
  await sendConfirmationEmail(email, code);
};
