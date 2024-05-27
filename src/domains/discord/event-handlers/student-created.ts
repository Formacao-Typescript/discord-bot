import { createDiscordInviteCreatedEvent } from "../../../events/discord/discord-invite-created.ts";
import { eventBus, Events } from "../../../events/event-bus.ts";
import { getConfig } from "../../../common/config.ts";
import { createApi } from "../api.ts";

const config = getConfig();
const discordApi = createApi(config);

eventBus.subscribe(Events.StudentCreatedEvent, async ({ data: { student } }) => {
  const inviteLink = await discordApi.createChannelInvite(config.channelId);

  eventBus.emit(createDiscordInviteCreatedEvent({ inviteLink, email: student.email }));
});
