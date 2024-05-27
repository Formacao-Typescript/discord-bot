/// <reference lib="deno.unstable" />

import { debug, serve, serveStatic } from "deps.ts";
import { handleInteraction } from "./domains/discord/bot/bot.ts";
import { handleWebhookRequest } from "./domains/hotmart/webhook.ts";
import { eventBus } from "./events/event-bus.ts";
import { getConfig } from "./common/config.ts";
export const log = debug("main");

const config = getConfig();

eventBus.listen();
serve({
  "/bot": (request) => handleInteraction(config, request),
  "/hotmart": (request) => handleWebhookRequest(request),
  "/assets/:filename+": serveStatic("../assets", { baseUrl: import.meta.url }),
}, {
  port: config.port,
});
