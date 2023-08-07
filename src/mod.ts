import { debug, serve } from "deps.ts";
import { handleInteraction } from "./bot.ts";

import { getConfig } from "./util/config.ts";
import { handleWebhookRequest } from "./webhook.ts";
export const log = debug("main");

const config = await getConfig();

serve({
  "/bot": (request) => handleInteraction(config, request),
  "/webhook": (request) => handleWebhookRequest(config, request),
}, {
  port: config.port,
});
