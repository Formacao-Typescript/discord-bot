// deno-lint-ignore-file no-explicit-any
/// <reference lib="deno.unstable" />
import { debug, serve, serveStatic } from "deps.ts";
import { handleInteraction } from "./bot.ts";
import { getConfig } from "./util/config.ts";
import { handleWebhookRequest } from "./webhook/webhook.ts";
import { emailQueueWorker } from "./workers/email.ts";
export const log = debug("main");

const config = await getConfig();
const kv = await Deno.openKv();

kv.listenQueue(async (message) => {
  log(`Received message of type ${(message as any).type} from queue`);
  await emailQueueWorker(message);
  log(`Processed message of type ${(message as any).type} from queue`);
});

serve({
  "/bot": (request) => handleInteraction(config, request),
  "/webhook": (request) => handleWebhookRequest(config, request),
  "/assets/:filename+": serveStatic("../assets", { baseUrl: import.meta.url }),
}, {
  port: config.port,
});
