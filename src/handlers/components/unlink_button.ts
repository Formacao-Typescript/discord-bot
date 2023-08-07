import { reply } from "../../util/response.ts";
import { ComponentHandler } from "./mod.ts";

export const unlinkButton: ComponentHandler = {
  id: "unlink",
  handle: async (ctx) => {
    await ctx.storage.students.unlinkByDiscordId(`${ctx.interaction.member!.id}`);

    return reply("Usuário desvinculado", { ephemeral: true });
  },
};
