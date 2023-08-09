import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../util/response.ts";
import { ComponentHandler } from "./mod.ts";

export const unlink: ComponentHandler = {
  id: "unlink",
  handle: async ({ storage, interaction, api }) => {
    const roles = await storage.roles.all();
    // deno-lint-ignore no-explicit-any
    const userId = (interaction as any)?.message?.mentions?.at(0)?.id;

    if (typeof userId !== "string") {
      return reply("Erro ao desvincular. O usuário selecionado não foi encontrado.", { ephemeral: true });
    }

    if (roles.length) {
      await api.removeUserRoles(userId, roles.map((role) => role.role));
    }

    await storage.students.unlinkByDiscordId(userId);

    return reply("Usuário desvinculado com sucesso", { flags: EPHEMERAL_MESSAGE_FLAG });
  },
};
