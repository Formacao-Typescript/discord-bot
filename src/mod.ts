import { debug, serve, serveStatic } from "deps.ts";
import { handleInteraction } from "./bot.ts";

import { getConfig } from "./util/config.ts";
import { handleWebhookRequest } from "./webhook/webhook.ts";
export const log = debug("main");

const config = await getConfig();

serve({
  "/bot": async (request) => {
    console.time(`Request ${request.method} ${request.url}`);
    const result = await handleInteraction(config, request);
    console.time(`Request ${request.method} ${request.url}`);
    return result;
  },
  "/webhook": (request) => handleWebhookRequest(config, request),
  "/assets/:filename+": serveStatic("../assets", { baseUrl: import.meta.url }),
}, {
  port: config.port,
});
