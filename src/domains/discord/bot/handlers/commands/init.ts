import { ApplicationCommandOptionTypes, ButtonStyles, ChannelTypes } from "deps.ts";
import { ButtonComponent } from "../../components/button.ts";
import { reply } from "../../response.ts";
import { Command } from "./mod.ts";

export const init: Command = {
  name: "init",
  description: "Envia a mensagem de login contendo o botão para os usuários clicarem",
  permissions: ["ADMINISTRATOR"],
  allowDm: false,
  options: [
    {
      name: "channel",
      description: "Canal onde a mensagem será enviada",
      type: ApplicationCommandOptionTypes.Channel,
      required: true,
      channelTypes: [ChannelTypes.GuildText],
    },
  ],
  run: async ({ interaction, api, storage }) => {
    const channelId = interaction.data?.options?.find(({ name }) => name === "channel")?.value;

    if (typeof channelId !== "string") {
      return reply("Erro ao enviar mensagem. O canal selecionado não foi encontrado.", { ephemeral: true });
    }

    const roles = await storage.roles.all();

    if (!roles.length) {
      return reply(
        "Você ainda não definiu nenhuma role a ser concedida a novos usuários. Utilize o comand /role para fazê-lo",
        { ephemeral: true },
      );
    }

    await api.sendMessage(
      channelId,
      "Boas vindas! Para confirmar seu e-mail e liberar seu acesso, clique no botão abaixo.",
      { button: new ButtonComponent("signup").label("Liberar meu acesso").style(ButtonStyles.Success) },
    );

    return reply("Mensagem de login enviada com sucesso", { flags: 64 });
  },
};
