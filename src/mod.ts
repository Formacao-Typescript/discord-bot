import { debug, serve, serveStatic } from "deps.ts";
import { handleInteraction } from "./bot.ts";

import { getConfig } from "./util/config.ts";
import { handleWebhookRequest } from "./webhook/webhook.ts";
export const log = debug("main");

const config = await getConfig();

serve({
  "/bot": async (request) => {
    const startTime = Date.now();
    console.time(`Request ${request.method} ${request.url} ${startTime}`);
    const result = await handleInteraction(config, request);
    console.timeEnd(`Request ${request.method} ${request.url} ${startTime}`);
    return result;
  },
  "/webhook": (request) => handleWebhookRequest(config, request),
  "/assets/:filename+": serveStatic("../assets", { baseUrl: import.meta.url }),
}, {
  port: config.port,
});
