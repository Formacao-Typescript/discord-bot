import { ButtonComponent } from "../../components/button.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../response.ts";
import { ComponentHandler } from "./mod.ts";
import { eventBus } from "../../../../../events/event-bus.ts";
import { createDiscordConfirmationCodeCreatedEvent } from "../../../../../events/discord/discord-confirmation-code-created.ts";

export const sendConfirmation: ComponentHandler = {
  id: "sendConfirmation",
  handle: async ({ interaction, storage }) => {
    const userId = `${interaction.member!.user!.id}`;
    const email = interaction.data?.components?.at(0)?.components
      // deno-lint-ignore no-explicit-any
      ?.find((component: any) => component.custom_id === "emailInput")
      ?.value;

    if (!email) {
      return reply("Desculpa. Não consegui encontrar seu email.", { flags: EPHEMERAL_MESSAGE_FLAG });
    }

    const preRegisteredUser = await storage.students.findPreRegistered(email);

    if (!preRegisteredUser) {
      return reply(
        `Opa. Não consegui achar o email ${email} no meu banco de dados. Tem certeza que foi com esse email que você comprou o curso?`,
        {
          flags: EPHEMERAL_MESSAGE_FLAG,
        },
      );
    }

    if (preRegisteredUser.discord?.id) {
      return reply(
        [
          `Opa. Parece que o email ${email} já está em uso por outro usuário no discord.`,
          "Se você acha que isso é um erro, entre em contato com a moderação",
        ].join(" "),
        { flags: EPHEMERAL_MESSAGE_FLAG },
      );
    }

    const code = await storage.confirmation.create(userId, email);

    await eventBus.emit(createDiscordConfirmationCodeCreatedEvent({ userId, email, code }));

    return reply("Enviamos um email com um código de confirmação. Por favor, verifique sua caixa de entrada.", {
      flags: EPHEMERAL_MESSAGE_FLAG,
      components: [
        {
          type: 1,
          components: [
            new ButtonComponent("showConfirmationModal").label("Recebi o código").build(),
            new ButtonComponent("signup").label("Tentar novamente").build(),
          ],
        },
      ],
    });
  },
};
