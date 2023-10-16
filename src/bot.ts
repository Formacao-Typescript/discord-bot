import { Interaction, InteractionResponseTypes, InteractionTypes, json } from "deps.ts";
import { createApi } from "./api.ts";
import { getCommand } from "./handlers/commands/mod.ts";
import { getHandler } from "./handlers/components/mod.ts";
import { Config } from "./util/config.ts";
import { getStorage } from "./util/db/db.ts";
import { validateRequestSignature } from "./util/request.ts";
import { reply } from "./util/response.ts";

let kv: Deno.Kv;

export async function handleInteraction(config: Config, request: Request) {
  const api = createApi(config);
  const [error, body] = await validateRequestSignature(request, config.publicKey);

  if (error) return error;

  const interaction = JSON.parse(body) as Interaction & {
    guild_id: string;
    channel_id: string;
    data: { custom_id: string };
  };

  if (!interaction.guild_id && interaction.type !== InteractionTypes.Ping) {
    return reply("Fale comigo em um servidor.", { ephemeral: true });
  }

  const storage = await getStorage();
  kv = kv ?? await Deno.openKv();

  switch (interaction.type) {
    case InteractionTypes.ApplicationCommand: {
      const command = getCommand(interaction.data?.name);

      return command.run({ interaction, storage, api, kv });
    }

    case InteractionTypes.MessageComponent:
    case InteractionTypes.ModalSubmit: {
      const interactionId = interaction.data?.custom_id!;
      const handler = getHandler(interactionId);

      console.time(`Request ${interaction.type} ${interactionId}`);
      const result = handler.handle({ interaction, storage, api, kv }, interactionId);
      console.timeEnd(`Request ${interaction.type} ${interactionId}`);
      return result;
    }

    default:
      return json({ type: InteractionResponseTypes.Pong });
  }
}
