import { createApi } from "../api.ts";
import { HotmartComposer } from "../util/composer.ts";
import { Config } from "../util/config.ts";
import { getStorage } from "../util/db/db.ts";
import { Event, EventType } from "../util/db/events.ts";
import { nsDebug } from "../util/debug.ts";
import * as ghost from "../util/ghost.ts";
import { sendWelcomeEmail } from "../util/mail.ts";

const log = nsDebug("webhook");

type Context = {
  event: Event;
  handled?: boolean;
  api: ReturnType<typeof createApi>;
  storage: ReturnType<typeof getStorage>;
  config: Config;
};

export const eventComponser = new HotmartComposer<Context>();

eventComponser.on(EventType.PurchaseApproved, async (ctx, next) => {
  let student = await ctx.storage.students.findByEmail(ctx.event.data.buyer.email);

  if (!student) {
    await ctx.storage.students.preRegister(ctx.event.data.buyer.email, ctx.event.data.purchase.offer.code);
    log(`Pre-registered ${ctx.event.data.buyer.email} for ${ctx.event.data.purchase.offer.code}`);
  }

  student = await ctx.storage.students.findByEmail(ctx.event.data.buyer.email);

  if (!student) {
    throw new Error(
      `cannot find student ${ctx.event.data.buyer.email} for offer ${ctx.event.data.purchase.offer.code}`,
    );
  }

  if (!student.welcomeEmailSent) {
    const inviteLinkId = await ctx.api.createChannelInvite(ctx.config.channelId);
    const inviteLink = `https://discord.gg/${inviteLinkId}`;
    const sendEmailResponse = await sendWelcomeEmail(ctx.event.data.buyer.email, inviteLink);
    log(
      `Sent welcome email to ${ctx.event.data.buyer.email}. Response: ${
        JSON.stringify(await sendEmailResponse.json())
      }`,
    );
    await student.completeWelcomeEmail();
  }

  await ghost.addMember(ctx.event.data.buyer.email, ctx.event.data.purchase.offer.code);
  log(`Added ${ctx.event.data.buyer.email} to Ghost.`);

  return next({ ...ctx, handled: true });
});

eventComponser.on([EventType.PurchaseProtest, EventType.PurchaseCanceled], async (ctx, next) => {
  const student = await ctx.storage.students.findByEmail(ctx.event.data.buyer.email);

  if (student?.discordId) {
    await student.unlink();
    log(`Unlinked ${student.discordId} from ${ctx.event.data.buyer.email}.`);

    await ctx.api.removeUserRoles(
      student.discordId,
      await ctx.storage.roles.getForOffer(student.tier).then((r) => r.map((r) => r.role)),
    );
    log(`Removed roles from ${student.discordId}.`);
  }

  await ghost.removeMember(ctx.event.data.buyer.email);
  log(`Update labels for ${ctx.event.data.buyer.email} on Ghost.`);

  return next({ ...ctx, handled: true });
});
