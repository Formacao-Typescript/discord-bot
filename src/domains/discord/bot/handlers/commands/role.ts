import { ApplicationCommandOptionTypes } from "deps.ts";
import { reply } from "../../response.ts";
import { Command } from "./mod.ts";

export const role: Command = {
  description: "Define a role a ser dada para usuários autenticados",
  name: "role",
  permissions: ["ADMINISTRATOR"],
  allowDm: false,
  options: [
    {
      name: "role",
      description: "Role escolhida",
      type: ApplicationCommandOptionTypes.Role,
      required: true,
    },
    {
      name: "tag",
      description: "Tag que um aluno deve ter para receber a role",
      type: ApplicationCommandOptionTypes.String,
      required: false,
    },
  ],
  run: async ({ interaction, storage }) => {
    const selectedRole = interaction.data?.options?.find((option) => option.name === "role")?.value as string;
    const tag = interaction.data?.options?.find((option) => option.name === "tag")?.value as string;

    if (typeof selectedRole !== "string") {
      return reply("Não encontrei a role selecionada. Por favor, tente novamente", { ephemeral: true });
    }

    await storage.roles.add({ role: selectedRole, tag });

    return reply("Configurações alteradas.", { ephemeral: true });
  },
};
