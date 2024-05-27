import { ApplicationCommandOptionTypes, ButtonStyles } from "deps.ts";
import { ButtonComponent } from "../../components/button.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../response.ts";
import { Command } from "./mod.ts";

export const info: Command = {
  name: "info",
  description: "Exibe informações sobre o usuário selecionado",
  permissions: ["ADMINISTRATOR"],
  allowDm: false,
  options: [
    {
      name: "user",
      description: "Usuário a ser exibido",
      type: ApplicationCommandOptionTypes.User,
      required: true,
    },
  ],
  run: async ({ interaction, storage }) => {
    const userId = interaction.data?.options?.find(({ name }) => name === "user")?.value;

    if (typeof userId !== "string") {
      return reply("Erro ao buscar informações. O usuário selecionado não foi encontrado.", { ephemeral: true });
    }

    const user = await storage.students.findByDiscordId(userId);

    if (!user) {
      return reply("Usuário não vinculado a um email até o momento.", { ephemeral: true });
    }

    const text = [
      "**Dados do aluno**",
      "",
      `**Usuário: <@${user.discord?.id}>**`,
      `**Email:** ${user.email}`,
      `**Tags:** ${user.tags.join(", ")}`,
      `**Criado em:** ${user.createdAt.toLocaleDateString("pt-BR")}`,
      `**Vinculado em:** ${user.discord!.linkedAt!.toLocaleDateString("pt-BR")}`,
    ].join("\n");

    return reply(text, {
      flags: EPHEMERAL_MESSAGE_FLAG,
      components: [{
        type: 1,
        components: [
          new ButtonComponent("unlink").label("Desvincular").style(ButtonStyles.Danger).build(),
        ],
      }],
    });
  },
};
