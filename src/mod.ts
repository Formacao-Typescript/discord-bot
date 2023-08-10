import { debug, serve, serveStatic } from "deps.ts";
import { handleInteraction } from "./bot.ts";

import { getConfig } from "./util/config.ts";
import { handleWebhookRequest } from "./webhook.ts";
export const log = debug("main");

const config = await getConfig();

serve({
  "/bot": (request) => handleInteraction(config, request),
  "/webhook": (request) => handleWebhookRequest(config, request),
  "/assets/:filename+": serveStatic("../assets", { baseUrl: import.meta.url }),
}, {
  port: config.port,
});
