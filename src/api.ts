import { ButtonComponent } from "./util/components/button.ts";
import { Config, getConfig } from "./util/config.ts";
import { nsDebug } from "./util/debug.ts";
const BASE_URL = "https://discord.com/api/v10";
const log = nsDebug("api");

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const GUILD_ID = await getConfig().then((config) => config.guildId);

const getCustomFetch = (token: string) => async (endpoint: string, payload: unknown, method: Method = "POST") => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const headers = { Authorization: `Bot ${token}`, "content-type": "application/json" };
  const body = JSON.stringify(payload);

  log(`Sending %s request to %s. headers: %s. body: %s`, method, url, JSON.stringify(headers), body);

  const response = await fetch(url, {
    headers,
    method,
    body,
  });

  log(`Response status: %s. body: %s`, response.status, await response.text());

  return response;
};

export function createApi(config: Config) {
  const sendRequest = getCustomFetch(config.token);

  type SendMessageParams = { button: ButtonComponent; ephemeral: boolean };
  const sendMessage = (
    channelId: string,
    text: string,
    { button, ephemeral = true }: Partial<SendMessageParams>,
  ) =>
    sendRequest(`/channels/${channelId}/messages`, {
      content: text,
      ...(ephemeral ? { flags: 64 } : {}),
      ...(!button ? {} : {
        components: [{
          type: 1,
          components: [
            button.build(),
          ],
        }],
      }),
    });

  const deleteMessage = (channelId: string, messageId: string) =>
    sendRequest(`/channels/${channelId}/messages/${messageId}`, {}, "DELETE");

  const sendFollowupMessage = (interactionToken: string, text: string, { ephemeral = true } = {}) =>
    sendRequest(`/webhooks/${config.applicationId}/${interactionToken}`, {
      content: text,
      ...(ephemeral ? { flags: 64 } : {}),
    });

  const addUserRoles = async (userId: string, roles: string | string[]) => {
    log(`Adding roles ${roles} to user ${userId}`);
    const roleArray = Array.isArray(roles) ? roles : [roles];
    for (const role of roleArray) {
      await sendRequest(`/guilds/${GUILD_ID}/members/${userId}/roles/${role}`, {}, "PUT");
    }
  };

  const removeUserRoles = async (userId: string, roles: string | string[]) => {
    log(`Removing roles ${roles} from user ${userId}`);
    const roleArray = Array.isArray(roles) ? roles : [roles];
    for (const role of roleArray) {
      await sendRequest(`/guilds/${GUILD_ID}/members/${userId}/roles/${role}`, {}, "DELETE");
    }
  };

  const createChannelInvite = async (channelId: string, duration = 604800) => {
    log(`Creating invite for channel ${channelId} with duration ${duration}`);
    const response = await sendRequest(`/channels/${channelId}/invites`, {
      max_age: duration,
      max_uses: 1,
      unique: true,
    });
    const { code } = await response.json();
    return code;
  };

  return {
    sendMessage,
    deleteMessage,
    sendFollowupMessage,
    addUserRoles,
    removeUserRoles,
    createChannelInvite,
  };
}

export type Api = ReturnType<typeof createApi>;
