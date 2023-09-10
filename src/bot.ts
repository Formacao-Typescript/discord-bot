import { Interaction, InteractionResponseTypes, InteractionTypes, json } from "deps.ts";
import { createApi } from "./api.ts";
import { getCommand } from "./handlers/commands/mod.ts";
import { getHandler } from "./handlers/components/mod.ts";
import { Config } from "./util/config.ts";
import { getStorage } from "./util/db/db.ts";
import { nsDebug } from "./util/debug.ts";
import { validateRequestSignature } from "./util/request.ts";
import { reply } from "./util/response.ts";

const log = nsDebug("bot");

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

  log("Handling interaction %s on guild %s", interaction.id, interaction.guild_id);
  const storage = await getStorage();

  switch (interaction.type) {
    case InteractionTypes.ApplicationCommand: {
      const command = getCommand(interaction.data?.name);

      return command.run({ interaction, storage, api });
    }

    case InteractionTypes.MessageComponent:
    case InteractionTypes.ModalSubmit: {
      const interactionId = interaction.data?.custom_id!;
      const handler = getHandler(interactionId);

      return handler.handle({ interaction, storage, api }, interactionId);
    }

    default:
      return json({ type: InteractionResponseTypes.Pong });
  }
}
