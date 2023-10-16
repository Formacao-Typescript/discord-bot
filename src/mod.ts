/// <reference lib="deno.unstable" />
import { debug, serve, serveStatic } from "deps.ts";
import { handleInteraction } from "./bot.ts";

import { getConfig } from "./util/config.ts";
import { handleWebhookRequest } from "./webhook/webhook.ts";
import { emailQueueWorker } from "./workers/email.ts";
export const log = debug("main");

const config = await getConfig();

serve({
  "/bot": (request) => handleInteraction(config, request),
  "/webhook": (request) => handleWebhookRequest(config, request),
  "/assets/:filename+": serveStatic("../assets", { baseUrl: import.meta.url }),
}, {
  port: config.port,
});

const kv = await Deno.openKv();
kv.listenQueue(async (message) => {
  await emailQueueWorker(message);
});
