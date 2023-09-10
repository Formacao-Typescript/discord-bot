import { getConfig } from "../../util/config.ts";
import { reply } from "../../util/response.ts";
import { eventComponser } from "../../webhook/composer.ts";
import { ComponentHandler } from "./mod.ts";

const config = await getConfig();
const idRegex = /^retry_event:(.*)$/;

export const retryEvent: ComponentHandler = {
  id: idRegex,
  handle: async (context, id) => {
    const eventId = id.match(idRegex)![1];
    if (!eventId) throw new Error(`invalid interaction id:${id}`);

    const api = context.api;
    const storage = context.storage;

    const event = await storage.events.findById(eventId);
    if (!event) throw new Error(`event not found with id ${eventId}`);

    return eventComponser.execute({ api, storage, event, config, handled: false })
      .catch((err) => reply(`Error reprocessing update: \`\`\`${err}\`\`\``, { ephemeral: true }))
      .then(() => reply("Update reprocessed", { ephemeral: true }));
  },
};
