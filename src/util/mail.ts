import Mailgun from "https://deno.land/x/mailgun@v1.2.1/index.ts";
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
