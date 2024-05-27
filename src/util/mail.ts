import { Mailgun } from "deps.ts";
import { getConfig } from "./config.ts";

const config = await getConfig();

const mailgun = new Mailgun({
  key: config.mailgunApiKey,
  region: config.mailgunRegion,
  domain: config.mailgunDomain,
});

export function sendConfirmationEmail(email: string, code: string) {
  return mailgun.send({
    to: email,
    from: config.mailgunFrom,
    subject: "Formação Typescript: Discord",
    template: "discord_confirmation",
    "h:X-Mailgun-Variables": JSON.stringify({
      confirmationCode: code,
    }),
  });
}

export function sendWelcomeEmail(email: string, inviteLink: string) {
  return mailgun.send({
    to: email,
    from: config.mailgunFrom,
    subject: "Boas vindas à Formação Typescript",
    template: "welcome",
    "h:X-Mailgun-Variables": JSON.stringify({
      inviteLink,
    }),
  });
}

export function sendReminderEmail(
  email: string,
  inviteLink: string,
  reminderNumber: "first" | "second" | "third",
) {
  return mailgun.send({
    to: email,
    from: config.mailgunFrom,
    subject: "Formação Typescript: Discord",
    template: `${reminderNumber}_discord_reminder`,
    "h:X-Mailgun-Variables": JSON.stringify({
      inviteLink,
    }),
  });
}
