import { getConfig } from "../common/config.ts";
import { DiscordConfirmationCodeCreatedEvent } from "./discord/discord-confirmation-code-created.ts";
import { DiscordInviteCreatedEvent } from "./discord/discord-invite-created.ts";
import { DiscordUserLinkingCompleteEvent } from "./discord/discord-user-linking-complete.ts";
import { DiscordUserUnlinkingRequestedEvent } from "./discord/discord-user-unlinking-requested.ts";
import { ReminderEmailSentEvent } from "./email/reminder-email-sent.ts";
import { WelcomeEmailSentEvent } from "./email/welcome-email-sent.ts";
import { EventEngine } from "./event-engine.ts";
import { PurchaseConfirmedEvent } from "./hotmart/purchase-confirmed.ts";
import { PurchaseRevokedEvent } from "./hotmart/purchase-revoked.ts";
import { StudentCreatedEvent } from "./students/student-created.ts";
import { StudentTagsChangedEvent } from "./students/student-tags-changed.ts";

const config = getConfig();
const kv = await Deno.openKv(config.kvUrl);
export const Events = {
  DiscordConfirmationCodeCreatedEvent,
  DiscordInviteCreatedEvent,
  PurchaseConfirmedEvent,
  PurchaseRevokedEvent,
  ReminderEmailSentEvent,
  StudentCreatedEvent,
  StudentTagsChangedEvent,
  DiscordUserLinkingCompleteEvent,
  DiscordUserUnlinkingRequestedEvent,
  WelcomeEmailSentEvent,
};

export const eventBus = new EventEngine(kv, Object.values(Events));
