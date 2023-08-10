import { json } from "deps.ts";
import { createApi } from "./api.ts";
import { Config, getConfig } from "./util/config.ts";
import { getStorage } from "./util/db/db.ts";
import { Event, EventType } from "./util/db/events.ts";
import { nsDebug } from "./util/debug.ts";
import { sendWelcomeEmail } from "./util/mail.ts";

const log = nsDebug("webhook");

const config = await getConfig();
const httpError = (code: string, message: string, status: number) =>
  json({
    ok: false,
    error: {
      code,
      message,
    },
  }, {
    status,
  });

export async function handleWebhookRequest(_config: Config, request: Request) {
  const storage = await getStorage();
  const api = createApi(config);
  const event: Event | undefined = await request.json().catch(() => undefined);

  if (!event) return httpError("bad_request", "cannot parse request body", 400);
  if (!event.data.buyer.email) return httpError("unprocessable_entity", "missing email field", 422);

  await storage.events.add(event);

  switch (event.event) {
    case EventType.PurchaseApproved: {
      await storage.students.preRegister(event.data.buyer.email, event.data.purchase.offer.code);
      log(`Pre-registered ${event.data.buyer.email} for ${event.data.purchase.offer.code}`);
      const inviteLinkId = await api.createChannelInvite(config.channelId);
      const inviteLink = `https://discord.gg/${inviteLinkId}`;
      const sendEmailResponse = await sendWelcomeEmail(event.data.buyer.email, inviteLink);
      log(
        `Sent welcome email to ${event.data.buyer.email}. Response: ${sendEmailResponse}`,
      );
      break;
    }
    case EventType.PurchaseProtest:
    case EventType.PurchaseCanceled: {
      const student = await storage.students.findByEmail(event.data.buyer.email);
      if (!student || !student.discordId) break;

      await storage.students.unlinkByDiscordId(student.discordId);

      await api.removeUserRoles(
        student.discordId,
        await storage.roles.getForOffer(student.tier).then((r) => r.map((r) => r.role)),
      );

      break;
    }
  }

  return new Response(null, { status: 202 });
}
