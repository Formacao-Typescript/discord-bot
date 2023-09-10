import { json } from "deps.ts";
import { createApi } from "../api.ts";
import { Config, getConfig } from "../util/config.ts";
import { getStorage } from "../util/db/db.ts";
import { Event } from "../util/db/events.ts";
import { eventComponser } from "./composer.ts";
import { ButtonComponent } from "../util/components/button.ts";
import { ButtonStyles } from "https://deno.land/x/discordeno@18.0.1/mod.ts";

const config = await getConfig();

const httpError = (code: string, message: string, status: number) =>
  json({
    ok: false,
    error: {
      code,
      message,
    },
  }, {
    status,
  });

export async function handleWebhookRequest(_config: Config, request: Request) {
  const api = createApi(config);
  const storage = getStorage();
  const event: Event | undefined = await request.json().catch(() => undefined);

  if (!event) return httpError("bad_request", "cannot parse request body", 400);
  if (!event.data.buyer.email) return httpError("unprocessable_entity", "missing email field", 422);

  await storage.events.add(event);

  try {
    await eventComponser.execute({ event, api, storage, config, handled: false });
  } catch (error) {
    api.sendMessage(
      config.devChannelId,
      `Error processing \`${event.event}\` event with id ${event.id}: \`\`\`${error}\`\`\``,
      {
        ephemeral: false,
        button: new ButtonComponent(`retry_event:${event.id}`).label("Retry").style(ButtonStyles.Danger),
      },
    )
      .catch(console.error);
  }

  return new Response(null, { status: 202 });
}
